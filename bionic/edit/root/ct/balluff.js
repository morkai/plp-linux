'use strict';

const {watchFile, unwatchFile, readFileSync, writeFileSync} = require('fs');
const os = require('os');
const axios = require('axios');
const logger = require('h5.logger').create({module: 'ct-balluff'});
const BalluffProcessorController = require('./BalluffProcessorController');

const DEV = os.hostname().toLowerCase().startsWith('msys');
const SERVER_CONFIG_FILE = `${__dirname}/../server/config.${DEV ? 'dev.' : ''}json`;
const BALLUFF_CONFIG_FILE = `${__dirname}/balluff.json`;
const DEBUG_FILE = `${__dirname}/../debug.txt`;

const config = {
  domain: '',
  line: '',
  stations: []
};
const timers = {};
const requests = {};
const stations = {};
let debug = false;
let processorControllers = [];

watchFile(DEBUG_FILE, () => reloadDebug());
watchFile(SERVER_CONFIG_FILE, () => reloadConfig());

reloadDebug();
reloadConfig();

process.on('SIGTERM', shutdown);

function reloadDebug()
{
  try
  {
    debug = readFileSync(DEBUG_FILE, 'utf8').trim() === '1';

    processorControllers.forEach(processorController =>
    {
      processorController.options.debug = debug;
    });

    logger.info('Reloaded the debug flag.', {
      debug
    });
  }
  catch (err)
  {
    logger.error(err, 'Failed to reload the debug flag.');
  }
}

async function reloadConfig()
{
  try
  {
    Object.assign(
      config,
      JSON.parse(readFileSync(SERVER_CONFIG_FILE, 'utf8'))
    );

    logger.info('Reloaded the server config.');
  }
  catch (err)
  {
    logger.error(err, `Failed to reload the server config.`);
  }

  const oldStations = JSON.stringify(config.stations);

  try
  {
    Object.assign(
      config,
      JSON.parse(readFileSync(BALLUFF_CONFIG_FILE, 'utf8'))
    );

    logger.info('Reloaded the Balluff config.');
  }
  catch (err)
  {
    logger.error(err, `Failed to reload the Balluff config.`);
  }

  await readRemoteConfig(false);

  const newStations = JSON.stringify(config.stations);

  if (!processorControllers.length || newStations !== oldStations)
  {
    restartMonitor();
  }
}

function restartMonitor()
{
  processorControllers.forEach(processorController =>
  {
    processorController.destroy();
  });
  processorControllers = [];

  const groupedProcessors = new Map();

  config.stations.forEach((station, i) =>
  {
    const key = `${station.processorIp}:${station.headPort}`;

    station.stationNo = i + 1;

    if (!groupedProcessors.has(key))
    {
      groupedProcessors.set(key, {
        debug,
        processorIp: station.processorIp,
        headPort: station.headPort,
        stations: []
      });
    }

    groupedProcessors.get(key).stations.push(station);
  });

  groupedProcessors.forEach(options =>
  {
    processorControllers.push(new BalluffProcessorController(options));
  });

  processorControllers.forEach(processorController =>
  {
    processorController.start(onCodeRead);
  });
}

function onCodeRead(stationNo, readResult)
{
  if (!stations[stationNo])
  {
    stations[stationNo] = {
      id: '',
      count: 0,
      time: 0
    };
  }

  const station = stations[stationNo];

  if (station.id === readResult.id)
  {
    return;
  }

  Object.assign(station, readResult);

  logger.debug('Code read.', {stationNo, readResult});

  sendCode(stationNo);
}

async function readRemoteConfig(restart)
{
  logger.info(`Reading the remote config...`);

  clearTimeout(timers.readRemoteConfig);
  delete timers.readRemoteConfig;

  try
  {
    const source = axios.CancelToken.source();

    requests.readRemoteConfig = source;

    const res = await axios({
      method: 'GET',
      url: `https://${config.domain}/ct/lines/${config.line}`,
      headers: {
        'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client',
        'X-API-KEY': process.env.WMES_API_KEY || '?'
      },
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: null,
      cancelToken: source.token
    });

    if (res.status !== 200 || !res.data || !Array.isArray(res.data.stations))
    {
      logger.warn(`Failed to read remote config: invalid response.`, {
        status: res.status,
        statusText: res.statusText,
        data: res.data
      });

      timers.readRemoteConfig = setTimeout(readRemoteConfig, 60000, true);
    }
    else
    {
      if (restart)
      {
        const oldStations = JSON.stringify(config.stations);
        const newStations = JSON.stringify(res.data.stations);

        if (!processorControllers.length || newStations !== oldStations)
        {
          setImmediate(restartMonitor);
        }
      }

      config.stations = res.data.stations;

      writeFileSync(BALLUFF_CONFIG_FILE, JSON.stringify({stations: config.stations}, null, 2));
    }
  }
  catch (err)
  {
    delete err.request;
    delete err.response;

    logger.error(err, `Failed to read the remote config.`);

    timers.readRemoteConfig = setTimeout(readRemoteConfig, 60000, true);
  }

  delete requests.readRemoteConfig;
}

async function sendCode(stationNo)
{
  const key = `sendCode${stationNo}`;

  if (timers[key])
  {
    clearTimeout(timers[key]);
    timers[key] = null;
  }

  if (shutdown.called
    || requests[key]
    || !config.domain
    || !config.line)
  {
    return;
  }

  const readResult = stations[stationNo];

  try
  {
    const source = axios.CancelToken.source();

    requests[key] = source;

    const res = await axios({
      method: 'GET',
      url: `https://${config.domain}/ct/todos/${config.line}/${config.station}`
        + `?id=${readResult.id}&time=${readResult.time}`,
      headers: {
        'X-API-KEY': process.env.WMES_API_KEY || '?'
      },
      timeout: 5000,
      maxRedirects: 0,
      validateStatus: null,
      cancelToken: source.token
    });

    if (shutdown.called)
    {
      return;
    }

    if (res.status !== 204)
    {
      logger.warn('Failed to send code: invalid response.', {
        stationNo,
        readResult,
        status: res.status,
        statusText: res.statusText,
        data: res.data
      });
    }

    if (stations[stationNo].id !== readResult.id)
    {
      setImmediate(sendCode, stationNo);
    }
  }
  catch (err)
  {
    if (shutdown.called)
    {
      return;
    }

    delete err.request;
    delete err.response;

    logger.error(err, 'Failed to send code.');

    timers[key] = setTimeout(sendCode, 1000, stationNo);
  }

  delete requests[key];
}

function shutdown()
{
  if (shutdown.called)
  {
    return;
  }

  logger.info('Shutting down...');

  shutdown.called = true;

  unwatchFile(DEBUG_FILE);
  unwatchFile(SERVER_CONFIG_FILE);

  Object.values(timers).forEach(timer => clearTimeout(timer));

  Object.values(requests).forEach(source => source.cancel('Shutdown.'));

  processorControllers.forEach(processorController => processorController.destroy());
  processorControllers = [];
}
