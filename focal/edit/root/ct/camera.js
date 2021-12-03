'use strict';

const {watchFile, readFileSync, readdirSync} = require('fs');
const {request} = require('https');
const {spawn, execSync} = require('child_process');

const CONFIG_FILE = `${__dirname}/../server/config.json`;
const QR_PATTERN = /^CT[0-9]+$/;

const config = {
  domain: '',
  line: '',
  station: 0,
  delayOk: 200,
  delayNok: 200
};
const timers = {};
let monitorProcess = null;
let lastCode = '';
let sendReq = null;

watchFile(CONFIG_FILE, {persistent: false}, () => reloadConfig());

reloadConfig();
restartMonitor();

process.on('SIGTERM', shutdown);

function reloadConfig()
{
  try
  {
    Object.assign(
      config,
      JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
    );

    console.log('Reloaded the config.');
  }
  catch (err)
  {
    console.error(`Failed to reload the config: ${err.message}`);
  }
}

function restartMonitor()
{
  console.log('Restarting the monitor...');

  if (timers.restartMonitor)
  {
    clearTimeout(timers.restartMonitor);
    timers.restartMonitor = null;
  }

  execSync(`ps a | grep wmes-ct-qrcamera-`, {encoding: 'utf8'})
    .split('\n')
    .filter(line => line.includes('java'))
    .map(line => line.trim().split(/\s+/).shift())
    .forEach(pid =>
    {
      console.log(`Killing the old process ${pid}...`);

      try
      {
        execSync(`kill -9 ${pid}`);
      }
      catch (err)
      {
        console.error(`Failed to kill the old process: ${err.message}`);
      }
    });

  const jar = readdirSync(__dirname).find(entry => entry.startsWith('wmes-ct-qrcamera-'));

  if (!jar)
  {
    console.error(`wmes-ct-qrcamera.jar not found!`);

    timers.restartMonitor = setTimeout(restartMonitor, 60000);

    return;
  }

  console.log(`Found ${jar}!`);

  monitorProcess = spawn('java', [
    '-jar',
    `${__dirname}/${jar}`,
    '--size', '640x480',
    '--delay-ok', config.delayOk.toString(),
    '--delay-nok', config.delayNok.toString(),
  ]);

  monitorProcess.stderr.setEncoding('utf8');
  monitorProcess.stderr.on('data', data =>
  {
    process.stdout.write(data);
  });

  let buffer = '';

  monitorProcess.stdout.setEncoding('utf8');
  monitorProcess.stdout.on('data', data =>
  {
    buffer += data;

    if (!buffer.endsWith('\n'))
    {
      return;
    }

    const codes = buffer
      .trim()
      .split('\n')
      .pop()
      .trim()
      .split('\t')
      .filter(d => QR_PATTERN.test(d))
      .sort((a, b) => a.localeCompare(b));

    buffer = '';

    if (codes.length === 0)
    {
      return;
    }

    scheduleKill();

    if (codes[0] === 'CT0')
    {
      codes.shift();
    }

    if (codes.length === 0 || codes[0] === lastCode)
    {
      return;
    }

    console.log(`Scanned codes: ${codes.join(' ')}`);

    lastCode = codes[0];

    sendCode();
  });

  monitorProcess.on('error', err =>
  {
    console.error(`Monitor error: ${err.message}`);

    scheduleRestart();
  });

  monitorProcess.on('close', () =>
  {
    console.log('Monitor closed.');

    scheduleRestart();
  });

  scheduleKill();

  function scheduleRestart()
  {
    if (scheduleRestart.called || shutdown.called)
    {
      return;
    }

    scheduleRestart.called = true;
    monitorProcess = null;

    clearTimeout(timers.killMonitor);
    clearTimeout(timers.restartMonitor);

    timers.restartMonitor = setTimeout(restartMonitor, scheduleKill.called ? 1000 : 10000);
  }

  function scheduleKill()
  {
    clearTimeout(timers.killMonitor);

    timers.killMonitor = setTimeout(() =>
    {
      console.log('No data: killing the monitor!');

      scheduleKill.called = true;

      if (monitorProcess)
      {
        monitorProcess.kill();
        monitorProcess = null;
      }
    }, 15000);
  }
}

function sendCode()
{
  if (timers.sendCode)
  {
    clearTimeout(timers.sendCode);
    timers.sendCode = null;
  }

  if (shutdown.called
    || sendReq
    || !lastCode
    || !config.domain
    || !config.line
    || !config.station)
  {
    return;
  }

  const code = lastCode;

  sendReq = request({
    host: config.domain,
    method: 'GET',
    path: `/ct/todos/${config.line}/${config.station}?id=${code}`,
    timeout: 10000,
    headers: {
      'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client',
      'X-API-KEY': process.env.WMES_API_KEY || '?'
    }
  });

  sendReq.on('timeout', () => sendReq.abort());

  sendReq.on('error', err =>
  {
    complete(new Error(`Request error: ${err.message}`));
  });

  sendReq.on('response', res =>
  {
    res.on('error', () =>
    {
      complete(new Error(`Response error: ${err.message}`));
    });

    res.on('data', () => {});

    res.on('close', () =>
    {
      if (res.statusCode >= 500)
      {
        complete(new Error(`Invalid response status code: ${res.statusCode}`));
      }
      else
      {
        complete();
      }
    })
  });

  sendReq.end();

  function complete(err)
  {
    if (complete.completed || shutdown.called)
    {
      return;
    }

    complete.completed = true;
    sendReq = null;

    if (err)
    {
      console.error(err.message);

      timers.sendCode = setTimeout(sendCode, 10000);

      return;
    }

    if (lastCode !== code)
    {
      timers.sendCode = setTimeout(sendCode, 1);
    }
  }
}

function shutdown()
{
  if (shutdown.called)
  {
    return;
  }

  console.log('Shutting down...');

  shutdown.called = true;

  Object.keys(timers).forEach(k =>
  {
    clearTimeout(timers[k]);
    timers[k] = null;
  });

  if (monitorProcess)
  {
    monitorProcess.kill();
    monitorProcess = null;
  }

  if (sendReq)
  {
    sendReq.abort();
    sendReq = null;
  }
}
