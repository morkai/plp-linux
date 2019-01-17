'use strict';

const {exec, execSync, spawn} = require('child_process');
const fs = require('fs');
const os = require('os');
const server = require('http').createServer();
const dev = /msys/i.test(os.hostname());

const PORT = dev ? 1339 : 80;

const appProcesses = {
  xiconf: {
    process: null,
    timer: null,
    spawn: () => spawn('node', [`${__dirname}/xiconf/backend/main.js`, `${__dirname}/xiconf/config/up.js`], {
      cwd: `${__dirname}/xiconf`,
      env: Object.assign({}, process.env, {
        NODE_ENV: 'production'
      })
    })
  },
  'ps-load': {
    process: null,
    timer: null,
    spawn: () => spawn(`${__dirname}/ps-load/node`, [`${__dirname}/ps-load/main.js`], {
      cwd: `${__dirname}/ps-load`,
      env: Object.assign({}, process.env, {
        NODE_ENV: 'production'
      })
    })
  }
};
let config = require('./server.json');
let localStorageSaveTimer = null;
let localStorage = {};

try
{
  localStorage = require('./localStorage.json');
}
catch (err) {}

if (Array.isArray(config.hosts))
{
  if (config.hosts.length)
  {
    config.host = config.hosts[0];
  }
  else
  {
    config.host = null;
  }

  delete config.hosts;
}

if (config.host)
{
  try { updateEtcHosts(); }
  catch (err) {}
}

server.on('error', onError);

server.on('request', function(req, res)
{
  req.on('error', onError);
  res.on('error', onError);

  if (req.url === '/')
  {
    return serveIndex(req, res);
  }

  if (/^\/[a-zA-Z0-9-]+\.png$/.test(req.url) && fs.existsSync(__dirname + req.url))
  {
    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    res.end(fs.readFileSync(__dirname + req.url));

    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/localStorage'))
  {
    return handleLocalStorage(req, res);
  }

  if (req.method === 'POST' && req.url === '/shutdown')
  {
    res.end();

    if (dev)
    {
      console.log('shutdown requested');
    }
    else
    {
      execSync('shutdown -P now');
    }

    return;
  }

  if (req.method === 'POST' && req.url === '/reboot')
  {
    res.end();

    if (dev)
    {
      console.log('reboot requested');
    }
    else
    {
      execSync('reboot now');
    }

    return;
  }

  if (req.method === 'POST' && req.url === '/resetBrowser')
  {
    res.end();

    resetBrowser();

    return;
  }

  if (req.method === 'POST' && req.url.startsWith('/config'))
  {
    return saveConfig(req, res);
  }

  if (req.method === 'POST' && req.url === '/syncClock')
  {
    return syncClock(req, res);
  }

  res.writeHead(404, {
    'Content-Type': 'text/plain; charset=utf-8'
  });
  res.end('404 Not Found');
});

Object.keys(appProcesses).forEach(appId =>
{
  if (config.apps.includes(appId))
  {
    startProcess(appId);
  }
});

server.once('listening', () => console.log(`listening on *:${PORT}`));

server.listen(PORT);

if (!dev)
{
  setTimeout(checkNetwork, 30000);
}

function log(message)
{
  console.error(`${new Date().toISOString()}\t${message}`);
}

function onError(err)
{
  console.error(`${new Date().toISOString()}\t${err.message}`);
}

function checkNetwork()
{
  const networkInterfaces = {
    lan: null,
    wlan: null
  };

  (function()
  {
    const ifconfig = execSync('ifconfig -a').toString();
    const re = /(eth[0-9]+|enp[0-9]+s[0-9]+|wlan[0-9]+|wlx[a-f0-9]+).*?HWaddr (.*?)\n/g;
    let matches;

    while ((matches = re.exec(ifconfig)) !== null)
    {
      const name = matches[1];
      const mac = matches[2].trim().toUpperCase();
      const ipMatches = execSync(`ifconfig ${name}`).toString().match(/inet addr:(.*?)\s+/);
      const iface = /^eth|enp/.test(name) ? 'lan' : 'wlan';

      if (networkInterfaces[iface] !== null)
      {
        continue;
      }

      networkInterfaces[iface] = {
        name: name,
        mac: mac,
        address: ipMatches ? ipMatches[1] : null
      };
    }
  })();

  if ((networkInterfaces.lan && networkInterfaces.lan.address)
    || (networkInterfaces.wlan && networkInterfaces.wlan.address))
  {
    return setTimeout(checkNetwork, 60000);
  }

  try
  {
    if (networkInterfaces.wlan)
    {
      if (networkInterfaces.lan)
      {
        execSync(`ifconfig ${networkInterfaces.lan.name} down`);
      }

      execSync(`ifconfig ${networkInterfaces.wlan.name} up`);
    }
    else if (networkInterfaces.lan)
    {
      execSync(`ifconfig ${networkInterfaces.lan.name} up`);
    }

    execSync('/etc/init.d/networking restart');
  }
  catch (err) {}

  setTimeout(checkNetwork, 30000);
}

function serveIndex(req, res)
{
  const networkInterfaces = os.networkInterfaces();
  const lo = {address: '?', mac: '?'};
  let lan = lo;
  let wlan = lo;

  Object.keys(networkInterfaces).forEach(name =>
  {
    const iface = networkInterfaces[name].filter(i => i.family === 'IPv4')[0] || lo;

    if (/^eth|enp/.test(name))
    {
      lan = iface;
    }
    else if (/^wlan|wlx/.test(name))
    {
      wlan = iface;
    }
  });

  const templateData = {
    remoteOrigin: dev ? 'https://dev.wmes.pl' : 'https://ket.wmes.pl',
    hostname: os.hostname(),
    lanAddress: lan.address,
    lanMac: lan.mac,
    wlanAddress: wlan.address,
    wlanMac: wlan.mac,
    config: JSON.stringify(config),
    localStorage: JSON.stringify(localStorage)
  };
  let html = fs.readFileSync(`${__dirname}/server.html`, 'utf8');

  Object.keys(templateData).forEach(k =>
  {
    html = html.replace(new RegExp(`\{${k}\}`, 'g'), templateData[k]);
  });

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(html);
}

function syncClock(req, res)
{
  exec(`service ntp stop; killall ntpd; ntpd -qg; killall ntpd; service ntp start`, {timeout: 44000}, err =>
  {
    res.writeHead(err ? 400 : 204);
    res.end();
  });
}

function saveConfig(req, res)
{
  try
  {
    fs.writeFileSync(`${__dirname}/server.json`, decodeURIComponent(req.url.substring('/config?'.length)));

    config = JSON.parse(fs.readFileSync(`${__dirname}/server.json`, 'utf8'));

    updateEtcHosts();

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

    res.end();
  }
  catch (err)
  {
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
    catch (err) {}

    switch (req.url)
    {
      case '/localStorage/write':
        writeLocalStorage(req, res);
        break;

      case '/localStorage/clear':
        clearLocalStorage(req, res);
        break;

      case '/localStorage/remoteItem':
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
  if (localStorageSaveTimer)
  {
    clearTimeout(localStorageSaveTimer);
  }

  localStorageSaveTimer = setTimeout(saveLocalStorage, 666);
}

function saveLocalStorage()
{
  localStorageSaveTimer = null;

  fs.writeFile(`${__dirname}/localStorage.json`, JSON.stringify(localStorage), err =>
  {
    if (err)
    {
      console.error(err.message);
    }
  });
}

function startProcess(appId)
{
  const appProcess = appProcesses[appId];

  if (!appProcess || appProcess.process)
  {
    return;
  }

  appProcess.process = appProcess.spawn();

  appProcess.process.on('error', err =>
  {
    console.error(`[${appId}] ${err.message}`);

    restartProcess(appId);
  });

  appProcess.process.on('close', restartProcess.bind(null, appId));
}

function stopProcess(appId)
{
  const appProcess = appProcesses[appId];

  if (appProcess && appProcess.process)
  {
    appProcess.process.removeAllListeners();
    appProcess.process.on('error', () => {});
    appProcess.process.kill();
    appProcess.process = null;
  }
}

function restartProcess(appId)
{
  const appProcess = appProcesses[appId];

  if (!appProcess)
  {
    return;
  }

  if (appProcess.timer)
  {
    clearTimeout(appProcess.timer);
  }

  appProcess.timer = setTimeout(() =>
  {
    appProcess.timer = null;
    stopProcess(appId);
    startProcess(appId);
  }, 333);
}

function updateEtcHosts()
{
  let etcHosts = fs.readFileSync('/etc/hosts', 'utf8');

  if (etcHosts.includes('ket.wmes.walkner.pl'))
  {
    etcHosts = etcHosts.replace(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\s+ket.wmes.walkner.pl/, `${config.host} ket.wmes.pl`);
  }
  else if (etcHosts.includes('ket.wmes.pl'))
  {
    etcHosts = etcHosts.replace(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+\s+ket.wmes.pl/, `${config.host} ket.wmes.pl`);
  }
  else
  {
    etcHosts += `\n\n${config.host} ket.wmes.pl\n`;
  }

  fs.writeFileSync('/etc/hosts', etcHosts.replace(/\n+/g, '\n'));
}

function resetBrowser()
{
  try
  {
    execSync('killall chrome; rm -rf /root/google-chrome');
  }
  catch (err)
  {
    console.error(`Failed to reset browser: ${err.message}`);
  }
}
