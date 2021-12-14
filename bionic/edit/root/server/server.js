'use strict';

const fs = require('fs');
const os = require('os');
const util = require('util');
const {exec, execSync} = require('child_process');
const execAsync = util.promisify(exec);
const logger = require('h5.logger').create({module: 'server'});
const server = require('https').createServer({
  key: fs.readFileSync(`${__dirname}/ssl/local.wmes.pl.key`),
  cert: fs.readFileSync(`${__dirname}/ssl/local.wmes.pl.full`)
});

const DEV = os.hostname().toLowerCase().startsWith('msys');
const CONFIG_FILE = DEV ? `${__dirname}/config.dev.json` : `${__dirname}/config.json`;

let config = {
  domain: '',
  host: '',
  apps: [],
  remote: '',
  staticIp: '',
  line: '',
  station: 0,
  ...require(CONFIG_FILE)
};

const ROOT = `${__dirname}/..`;
const PORT = DEV ? 444 : 443;
const CONTENT_TYPES = {
  html: 'text/html',
  js: 'text/javascript',
  json: 'application/json',
  css: 'text/css',
  webp: 'image/webp'
};

logger.info(`Initializing...`, {clientInfo: getClientInfo()});

logger.info('Removing old PIDs...');
execSync(`rm -rf ${ROOT}/pid/*.pid`);

const appProcesses = require('./appProcesses');
const timers = {};
let localStorageSaveTimer = null;
let localStorage = {};

try
{
  logger.info(`Reading localStorage.json...`);

  localStorage = require('./localStorage.json');
}
catch (err)
{
  logger.error(err, `Failed to read localStorage.json.`);
}

if (config.host && config.domain)
{
  try
  {
    updateEtcHosts();
  }
  catch (err)
  {
    logger.error(err, `Failed to update /etc/hosts.`);
  }
}

server.on('error', err =>
{
  logger.error(err, `HTTP server error.`);
});

server.on('request', handleRequest);

Object.keys(appProcesses).forEach(appId =>
{
  if (config.apps.includes(appId))
  {
    startProcess(appId);
  }
});

server.once('listening', () =>
{
  logger.info(`Listening...`, {port: PORT});

  fs.writeFileSync(`${ROOT}/pid/server.pid`, process.pid.toString());

  scheduleUpdate();
});

server.listen(PORT);

process.on('SIGTERM', shutdown);

function shutdown()
{
  if (shutdown.called)
  {
    return;
  }

  logger.info(`Shutting down...`);

  Object.values(timers).forEach(timer => clearTimeout(timer));

  server.close();

  Object.keys(appProcesses).forEach(appId => stopProcess(appId));
}

function handleRequest(req, res)
{
  req.on('error', err => logger.warn(err, 'HTTP request error.'));
  res.on('error', err => logger.warn(err, 'HTTP response error.'));

  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type');

  if (req.method === 'OPTIONS')
  {
    res.writeHead(204);
    res.end();

    return;
  }

  if (req.url === '/')
  {
    if (noRemoteAccess(req, res)) return;

    return serveIndex(req, res);
  }

  if (req.url === '/client.json')
  {
    return serveClientInfo(req, res);
  }

  if (/^\/[a-zA-Z0-9-]+\.(html|css|js|webp)$/.test(req.url)
    && fs.existsSync(`${__dirname}/static/${req.url}`))
  {
    if (noRemoteAccess(req, res)) return;

    res.setHeader('Content-Type', CONTENT_TYPES[req.url.split('.').pop()]);
    res.end(fs.readFileSync(`${__dirname}/static/${req.url}`));

    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/localStorage'))
  {
    if (noRemoteAccess(req, res)) return;

    return handleLocalStorage(req, res);
  }

  if (req.method === 'POST' && req.url === '/shutdown')
  {
    if (noRemoteAccess(req, res)) return;

    logger.info('Shutdown requested...');

    res.end();

    if (!DEV)
    {
      setTimeout(() => execSync('shutdown -P now'), 333);
    }

    return;
  }

  if (req.method === 'POST' && req.url === '/reboot')
  {
    if (noRemoteAccess(req, res)) return;

    logger.info('Reboot requested...');

    res.end();

    if (!DEV)
    {
      setTimeout(() => execSync('reboot now'), 333);
    }

    return;
  }

  if (req.method === 'POST' && req.url === '/resetBrowser')
  {
    if (noRemoteAccess(req, res)) return;

    res.end();

    resetBrowser();

    return;
  }

  if (req.method === 'POST' && req.url === '/restartBrowser')
  {
    if (noRemoteAccess(req, res)) return;

    res.end();

    restartBrowser();

    return;
  }

  if (req.method === 'POST' && req.url === '/noKiosk')
  {
    if (noRemoteAccess(req, res)) return;

    res.end();

    noKiosk();

    return;
  }

  if (req.url.startsWith('/restartApp'))
  {
    if (noRemoteAccess(req, res)) return;

    let appId;

    try
    {
      appId = new URL(req.url, 'http://localhost').searchParams.get('id');
    }
    catch (err) {}

    if (appProcesses[appId])
    {
      restartProcess(appId);

      res.end();
    }
    else
    {
      res.writeHead(400, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end('400 Bad Request');
    }

    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/config'))
  {
    if (noRemoteAccess(req, res)) return;

    return saveConfig(req, res);
  }

  if (req.method === 'POST' && req.url === '/syncClock')
  {
    if (noRemoteAccess(req, res)) return;

    return syncClock(req, res);
  }

  if (req.method === 'POST' && req.url.startsWith('/trw'))
  {
    if (noRemoteAccess(req, res)) return;

    return require('./trw').handleRequest(req, res);
  }

  if (req.method === 'GET' && req.url === '/update')
  {
    if (noRemoteAccess(req, res)) return;

    res.end();

    checkUpdate();

    return;
  }

  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('404 Not Found');
}

function tryExec(cmd)
{
  try
  {
    return execSync(cmd, {stdio: ['ignore', 'pipe', 'ignore']}).toString().trim();
  }
  catch (err)
  {
    if (!DEV)
    {
      logger.error(err, `Failed to execute command.`, {cmd});
    }
  }

  return '';
}

function readRequestBody(req)
{
  return new Promise((resolve) =>
  {
    const body = [];

    req.on('data', data =>
    {
      body.push(data);
    });

    req.on('end', () =>
    {
      resolve(Buffer.concat(body));
    });
  });
}

function serveClientInfo(req, res)
{
  res.writeHead(200, {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(getClientInfo(), null, 2));
}

function noRemoteAccess(req, res)
{
  if (req.connection.remoteAddress.includes('127.0.0.1')
    || req.headers['x-api-key'] === process.env.WMES_API_KEY)
  {
    return false;
  }

  res.writeHead(403, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end('Remote access not allowed.');

  return true;
}

function serveIndex(req, res)
{
  logger.info('Serving index...');

  const templateData = {
    ...getClientInfo(),
    localStorage,
    apiKey: process.env.WMES_API_KEY
  };
  const html = fs.readFileSync(`${__dirname}/static/server.html`, 'utf8')
    .replace('{client}', JSON.stringify(templateData));

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(html);
}

function getClientInfo()
{
  return {
    _id: os.hostname(),
    config,
    versions: getVersions(),
    hardware: getHardware(),
    networkInterfaces: getNetworkInterfaces()
  };
}

function getVersions()
{
  let mongodb = '';
  let java = '';

  try { java = fs.readFileSync('/usr/lib/jvm/java-11-amazon-corretto/version.txt', 'utf8').trim(); } catch (err) {}
  try { mongodb = tryExec('mongod --version').match('db version v(.*?)\n')[1]; } catch (err) {}

  return {
    client: fs.readFileSync(`${ROOT}/version.txt`, 'utf8').trim(),
    kernel: os.release(),
    chrome: DEV ? 'DEV' : tryExec('google-chrome --version').replace('Google Chrome ', ''),
    node: process.versions.node,
    mongodb,
    java,
    net: DEV ? 'DEV' : tryExec('dotnet --list-runtimes').split(' ')[1] || ''
  };
}

function getHardware()
{
  return {
    biosVendor: DEV ? 'DEV' : tryExec('dmidecode -s bios-vendor').toUpperCase(),
    serialNumber: DEV ? 'DEV' : tryExec('dmidecode -s system-serial-number').toUpperCase(),
    productName: DEV ? 'DEV' : tryExec('dmidecode -s system-product-name').toUpperCase(),
    cpus: os.cpus().map(cpu => cpu.model),
    memory: Math.round(os.totalmem() / 1024 / 1024)
  };
}

function getNetworkInterfaces()
{
  let lastNetworkInterface = null;
  let lines = [];
  const networkInterfaces = {};

  if (DEV)
  {
    return networkInterfaces;
  }

  try
  {
    lines = execSync('ifconfig -a').toString().split('\n');
  }
  catch (err)
  {
    return networkInterfaces;
  }

  lines.forEach(line =>
  {
    let matches = line.match(/^([a-z0-9]+):/i);

    if (matches)
    {
      lastNetworkInterface = matches[1];

      networkInterfaces[lastNetworkInterface] = {
        addresses: [],
        mac: ''
      };

      return;
    }

    if (!lastNetworkInterface)
    {
      return;
    }

    matches = line.match(/inet\s+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+/i);

    if (matches)
    {
      networkInterfaces[lastNetworkInterface].addresses.push(matches[1]);
    }

    matches = line.match(/\s+([a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2}:[a-f0-9]{2})\s+/i);

    if (matches)
    {
      networkInterfaces[lastNetworkInterface].mac = matches[1].toUpperCase();
    }
  });

  delete networkInterfaces.lo;

  return networkInterfaces;
}

function syncClock(req, res)
{
  logger.info(`Syncing clock...`);

  exec(`service ntp stop; killall ntpd; ntpd -qg; killall ntpd; service ntp start`, {timeout: 44000}, err =>
  {
    if (err)
    {
      logger.error(err, `Failed to sync clock.`);
    }
    else
    {
      logger.info(`Clock synced!`);
    }

    res.writeHead(err ? 400 : 204);
    res.end();
  });
}

async function saveConfig(req, res)
{
  logger.info('Saving config...');

  try
  {
    const body = await readRequestBody(req);
    const newConfig = JSON.parse(body.toString());
    const setup = newConfig.staticIp !== config.staticIp;
    const orientation = newConfig.orientation !== config.orientation;

    config = newConfig;

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config) + '\n');

    logger.info(`New config:`, config);

    updateEtcHosts();

    if (orientation)
    {
      updateOrientation();
    }

    if (setup)
    {
      setTimeout(execSetup, 1337);
    }
    else
    {
      Object.keys(appProcesses).forEach(appId =>
      {
        if (config.apps.includes(appId))
        {
          startProcess(appId);
        }
        else
        {
          stopProcess(appId);
        }
      });
    }

    res.end();
  }
  catch (err)
  {
    logger.error(err, `Failed to save config.`);

    res.writeHead(500, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    res.end(err.stack);
  }
}

function handleLocalStorage(req, res)
{
  const body = [];

  req.on('data', chunk => body.push(chunk));

  req.on('end', () =>
  {
    try
    {
      req.body = JSON.parse(Buffer.concat(body).toString());
    }
    catch (err)
    {
      res.end();

      return;
    }

    switch (req.url)
    {
      case '/localStorage/write':
        writeLocalStorage(req, res);
        break;

      case '/localStorage/clear':
        clearLocalStorage(req, res);
        break;

      case '/localStorage/removeItem':
        removeLocalStorageItem(req, res);
        break;

      case '/localStorage/setItem':
        setLocalStorageItem(req, res);
        break;
    }

    res.end();
  });
}

function writeLocalStorage(req, res)
{
  localStorage[req.body.app] = req.body.data;

  scheduleLocalStorageSave();
}

function clearLocalStorage(req, res)
{
  logger.info(`Clearing local storage...`, {app: req.body.app});

  delete localStorage[req.body.app];

  scheduleLocalStorageSave();
}

function removeLocalStorageItem(req, res)
{
  if (localStorage[req.body.app])
  {
    delete localStorage[req.body.app][req.body.key];

    scheduleLocalStorageSave();
  }
}

function setLocalStorageItem(req, res)
{
  if (!localStorage[req.body.app])
  {
    localStorage[req.body.app] = {};
  }

  localStorage[req.body.app][req.body.key] = req.body.value;

  scheduleLocalStorageSave();
}

function scheduleLocalStorageSave()
{
  if (!saveLocalStorage.saving)
  {
    saveLocalStorage.saving = 0;
  }

  if (saveLocalStorage.saving)
  {
    saveLocalStorage.saving += 1;

    return;
  }

  if (localStorageSaveTimer)
  {
    clearTimeout(localStorageSaveTimer);
  }

  localStorageSaveTimer = setTimeout(saveLocalStorage, 666);
}

function saveLocalStorage()
{
  localStorageSaveTimer = null;

  if (DEV)
  {
    return;
  }

  saveLocalStorage.saving = 1;

  fs.writeFile(`${__dirname}/localStorage.json`, JSON.stringify(localStorage), err =>
  {
    if (err)
    {
      logger.error(err, 'Failed to save localStorage.json.');
    }

    if (saveLocalStorage.saving > 1)
    {
      setImmediate(scheduleLocalStorageSave);
    }

    saveLocalStorage.saving = 0;
  });
}

function startProcess(appId)
{
  Object.keys(appProcesses[appId] || {}).forEach(subAppId =>
  {
    startSubProcess(appId, subAppId);
  });
}

function restartProcess(appId)
{
  logger.info(`Process restart requested...`, {appId});

  if (config.apps.includes(appId))
  {
    startProcess(appId);
  }
}

function startSubProcess(appId, subAppId)
{
  if (shutdown.called)
  {
    return;
  }

  const appProcess = appProcesses[appId][subAppId];

  if (!appProcess)
  {
    return;
  }

  if (appProcess.process)
  {
    return restartSubProcess(appId, subAppId);
  }

  if (subAppId === '$services')
  {
    startServices(appProcess);
  }

  if (subAppId.startsWith('$'))
  {
    return;
  }

  logger.info(`Starting process...`, {appId, subAppId});

  if (!appProcess.log)
  {
    appProcess.log = fs.createWriteStream(`${ROOT}/log/${appId}_${subAppId}.txt`, {
      flags: 'a',
      emitClose: true
    });

    appProcess.log.on('error', err =>
    {
      logger.warn(err, `Process log error.`, {appId, subAppId});
    });

    appProcess.log.on('close', () =>
    {
      appProcess.log = null;
    });
  }

  appProcess.process = appProcess.spawn();
  appProcess.onSuccess = setTimeout(onSuccess, 1);

  appProcess.process.stderr.pipe(appProcess.log, {end: false});
  appProcess.process.stdout.pipe(appProcess.log, {end: false});

  appProcess.process.on('error', err =>
  {
    logger.warn(err, `Process error.`, {appId, subAppId});
    onFailure();
  });

  appProcess.process.on('close', () =>
  {
    logger.info(`Process closed.`, {appId, subAppId});
    onFailure();
  });

  function onSuccess()
  {
    if (appProcess.process && appProcess.process.pid)
    {
      fs.writeFileSync(`${ROOT}/pid/${appId}_${subAppId}.pid`, String(appProcess.process.pid));
    }
  }

  function onFailure()
  {
    clearTimeout(appProcess.onSuccess);
    appProcess.onSuccess = null;

    restartSubProcess(appId, subAppId);
  }
}

function stopProcess(appId)
{
  Object.keys(appProcesses[appId] || {}).forEach(subAppId =>
  {
    stopSubProcess(appId, subAppId);
  });
}

function stopSubProcess(appId, subAppId, done)
{
  if (!done)
  {
    done = () => {};
  }

  if (subAppId.startsWith('$'))
  {
    return done();
  }

  fs.unlink(`${ROOT}/pid/${appId}_${subAppId}.pid`, () => {});

  const appProcess = appProcesses[appId][subAppId];

  if (!appProcess)
  {
    return done();
  }

  if (appProcess.timer)
  {
    clearTimeout(appProcess.timer);
    appProcess.timer = null;
  }

  const {process} = appProcess;

  if (!process)
  {
    return done();
  }

  appProcess.process = null;

  logger.debug(`Stopping process...`, {appId, subAppId});

  const k = `stopSubProcess:${process.pid}`;
  const finalize = timeout =>
  {
    if (timers[k])
    {
      if (timeout)
      {
        process.kill('SIGKILL');
      }

      clearTimeout(timers[k]);
      delete timers[k];
      done();
    }
  };

  timers[k] = setTimeout(finalize, 10000, true);

  process.removeAllListeners();
  process.on('error', () => {});
  process.on('exit', () => finalize(false));
  process.kill('SIGTERM');
}

function restartSubProcess(appId, subAppId)
{
  if (shutdown.called)
  {
    return;
  }

  const appProcess = appProcesses[appId][subAppId];

  if (!appProcess)
  {
    return;
  }

  logger.debug(`Restarting process...`, {appId, subAppId});

  if (appProcess.timer)
  {
    clearTimeout(appProcess.timer);
  }

  if (!appProcess.restartCounter)
  {
    appProcess.restartCounter = 0;
  }

  appProcess.restartCounter += 1;

  appProcess.timer = setTimeout(() =>
  {
    appProcess.timer = null;
    stopSubProcess(
      appId,
      subAppId,
      startSubProcess.bind(null, appId, subAppId)
    );
  }, Math.min(appProcess.restartCounter * 333, 15000));
}

function startServices(services)
{
  logger.debug(`Starting services...`, {services});

  if (DEV)
  {
    return;
  }

  services.forEach(service =>
  {
    execSync(`service ${service} start`);
  })
}

function updateEtcHosts()
{
  logger.debug(`Updating /etc/hosts...`);

  if (DEV)
  {
    return;
  }

  const etcHosts = fs.readFileSync('/etc/hosts', 'utf8').split('\n').filter(line =>
  {
    return line.trim().length !== 0
      && !line.includes(config.host)
      && !line.includes(config.domain)
      && !line.includes('dyn.wmes.pl');
  });

  etcHosts.push(`${config.host} ${config.domain} dyn.wmes.pl`);
  etcHosts.push('');

  fs.writeFileSync('/etc/hosts', etcHosts.join('\n'));
}

function updateOrientation()
{
  logger.debug('Updating orientation...');

  if (DEV)
  {
    return;
  }

  try
  {
    process.stdout.write(execSync(`node /root/set-resolution.js`, {encoding: 'utf8'}));
  }
  catch (err)
  {
    logger.error(err, `Failed to update orientation.`);
  }
}

function resetBrowser()
{
  logger.debug('Resetting browser...');

  if (DEV)
  {
    return;
  }

  try
  {
    execSync(`killall chrome ; rm -rf ${ROOT}/google-chrome ; echo "{}" > ${ROOT}/server/localStorage.json`);
  }
  catch (err)
  {
    logger.error(err, `Failed to reset browser.`);
  }
}

function restartBrowser()
{
  logger.debug('Restarting browser...');

  if (DEV)
  {
    return;
  }

  try
  {
    execSync('pkill --oldest chrom*');
  }
  catch (err)
  {
    logger.error(err, `Failed to restart browser.`);
  }
}

function noKiosk()
{
  logger.debug(`Disabling kiosk...`);

  if (DEV)
  {
    return;
  }

  try
  {
    execSync('touch /tmp/no-kiosk ; pkill --oldest chrom*');
  }
  catch (err)
  {
    logger.error(err, `Failed to no kiosk.`);
  }
}

function execSetup()
{
  logger.debug(`Executing setup...`);

  if (DEV)
  {
    return;
  }

  try
  {
    execSync(`${process.execPath} ${ROOT}/setup.js`);
  }
  catch (err)
  {
    logger.error(err, `Failed to exec setup.`);
  }
}

function scheduleUpdate()
{
  const now = new Date();

  if (!scheduleUpdate.lastCheckAt)
  {
    scheduleUpdate.lastCheckAt = new Date(0);
  }

  if ((now - scheduleUpdate.lastCheckAt) > 30000
    && now.getDay() === 0
    && now.getHours() > 6
    && now.getHours() < 18)
  {
    return checkUpdate();
  }

  const delay = Math.round(3600 + Math.random() * 3600) * 1000;

  logger.debug('Scheduled next update check.', {
    nextCheckAt: new Date(now.getTime() + delay),
    nextCheckDelay: delay / 1000
  })

  scheduleTimeout(scheduleUpdate, delay);

  scheduleUpdate.lastCheckAt = now;
}

async function checkUpdate()
{
  if (checkUpdate.checking)
  {
    logger.debug('Not checking for an update: already checking.');

    return;
  }

  checkUpdate.checking = true;

  const versions = getVersions();

  logger.debug(`Checking for an update...`, {currentVersions: versions});

  const currentVersion = +versions.client;

  try
  {
    const availableVersionsRes = await execAsync(`curl --insecure https://dyn.wmes.pl/wmes/clients/updates`);
    const availableVersions = JSON.parse(availableVersionsRes.stdout)
      .filter(v => v > currentVersion)
      .sort((a, b) => a - b);

    if (!Array.isArray(availableVersions))
    {
      throw new Error('Invalid /wmes/clients/updates response.');
    }

    if (!availableVersions.length)
    {
      logger.debug(`No updates available.`);

      scheduleTimeout(scheduleUpdate, 3600 * 1000);
    }
    else
    {
      logger.debug(`Available versions:`, {availableVersions});

      await update(currentVersion, availableVersions[0]);

      scheduleTimeout(checkUpdate, 60 * 1000);
    }
  }
  catch (err)
  {
    logger.error(err, `Failed to check for an update.`);

    scheduleTimeout(scheduleUpdate, 60 * 10 * 1000);
  }

  checkUpdate.checking = false;
}

async function update(currentVersion, newVersion)
{
  logger.debug(`Updating...`, {
    currentVersion,
    newVersion
  });

  if (DEV)
  {
    return;
  }

  try { await execAsync(`rm -rf ${ROOT}/update.7z ${ROOT}/update-do.sh ${ROOT}/update-do.js`); }
  catch (err) {}

  const newVersionUrl = `https://dyn.wmes.pl/wmes/clients/updates/${newVersion}`;

  await execAsync(`wget --no-check-certificate --connect-timeout=3 --read-timeout=3 -t 1 -O ${ROOT}/update.7z ${newVersionUrl}`);
  await execAsync(`7zr x -y -o${ROOT} ${ROOT}/update.7z`);
  await execAsync(`chmod +x ${ROOT}/update-do.sh`);
  await execAsync(`${ROOT}/update-do.sh > ${ROOT}/log/update.txt 2>&1`);

  logger.debug(`Updated!`, {newVersions: getVersions()});
}

function scheduleTimeout(fn, timeout)
{
  clearTimeout(timers[fn.name]);
  timers[fn.name] = setTimeout(fn, timeout);
}

