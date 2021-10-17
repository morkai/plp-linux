const CLOCK_DIFF = 5000;

const CONFIG = CLIENT.config;
const API_KEY = CLIENT.apiKey || '?';
const LOCAL_STORAGE = CLIENT.localStorage;

delete CLIENT.apiKey;
delete CLIENT.localStorage;

const $ = selector => document.querySelector(selector);
const $all = selector => document.querySelectorAll(selector);

let frames = [];
let readyApps = {};
let overlayTimer = null;
let lastSwitchAppAt = 0;
let startTries = 0;
let devMenuCounter = 0;
let devMenuTimer = null;
let spinner = setInterval(updateSpinner, 500);

updateSpinner();

(() =>
{
  $('#hostname').textContent = `${CLIENT._id} v${CLIENT.versions.client}`;

  updateNetworkInterfaces();
})();

CONFIG.apps.forEach(app =>
{
  if (document.querySelector(`input[name="apps"][value="${app}"][data-no-screen]`))
  {
    return;
  }

  const frame = document.createElement('iframe');
  frame.dataset.app = app;
  frame.classList.add('off');

  frames.push(frame);

  $('#frames').appendChild(frame);
});

if (!CONFIG.host || !CONFIG.apps.length)
{
  toggleConfig();
}

if (!CONFIG.host)
{
  resolveHost();
}

const messageHandlers = {
  init: handleInitMessage,
  ready: handleReadyMessage,
  switch: handleSwitchMessage,
  apps: handleAppsMessage,
  localStorage: handleLocalStorageMessage,
  refresh: handleRefreshMessage,
  reboot: reboot,
  shutdown: shutdown,
  config: toggleConfig,
  resetBrowser: resetBrowser,
  restartBrowser: restartBrowser,
  noKiosk: noKiosk
};

window.addEventListener('message', function(e)
{
  const msg = e.data;

  if (messageHandlers[msg.type])
  {
    let app = null;
    let sourceWindow = null;

    for (let frame of frames)
    {
      if (frame.contentWindow === e.source)
      {
        app = frame.dataset.app;
        sourceWindow = frame.contentWindow;

        break;
      }
    }

    messageHandlers[msg.type](msg, app, sourceWindow);
  }
  else
  {
    console.log(`Unknown message:`, msg);
  }
});

$('#configure').addEventListener('click', toggleConfig);
$('#overlay').addEventListener('submit', saveConfig);
$('#refresh').addEventListener('click', () => window.location.reload());
$('#power').addEventListener('click', togglePowerOptions);
$('#reboot').addEventListener('click', reboot);
$('#shutdown').addEventListener('click', shutdown);
$('#resetBrowser').addEventListener('click', resetBrowser);
$('#restartBrowser').addEventListener('click', restartBrowser);
$('#noKiosk').addEventListener('click', noKiosk);

for (const el of $all('input[name="apps"]'))
{
  el.addEventListener('change', () => toggleStationValidity());
}

for (const el of $all('input[name="host"]'))
{
  el.addEventListener('change', () => setUpProdLines());
}

setInterval(focusActiveApp, 5000);

if (CONFIG.host && CONFIG.apps.length)
{
  start();
}

function updateSpinner()
{
  const spinnerEl = $('#spinner');
  const frames = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1]
  ];
  let frameI = +spinnerEl.dataset.frame + 1;

  if (frameI === frames.length)
  {
    frameI = 0;
  }

  spinnerEl.dataset.frame = frameI;

  const frame = frames[frameI];

  for (let i = 0; i < 3; ++i)
  {
    spinnerEl.children[i].style.visibility = frame[i] ? 'visible' : 'hidden';
  }
}

function handleInitMessage(msg, app, src)
{
  console.log(`Working host: ${msg.host} of app: ${app}`);

  src.postMessage({type: 'init', data: {...CLIENT, apiKey: API_KEY}}, '*');
}

function handleReadyMessage(msg, app)
{
  clearTimeout(overlayTimer);
  overlayTimer = setTimeout(hideOverlay, 1337);

  readyApps[app] = true;

  console.log(`Ready app: ${app}`);
}

function handleSwitchMessage(msg, app)
{
  console.log(`Switch app from: ${app}`);

  if (msg.newApp)
  {
    return switchToApp(msg.newApp);
  }

  if (Object.keys(readyApps).length <= 1 || Date.now() - lastSwitchAppAt < 1000)
  {
    return;
  }

  lastSwitchAppAt = Date.now();

  const frames = $all('iframe');
  let activeFrameI = -1;

  for (let i = 0; i < frames.length; ++i)
  {
    if (!frames[i].classList.contains('off'))
    {
      activeFrameI = i;

      break;
    }
  }

  if (activeFrameI + 1 === frames.length)
  {
    activeFrameI = -1;
  }

  activeFrameI += 1;

  for (let i = 0; i < activeFrameI; ++i)
  {
    frames[i].classList.add('off');
  }

  for (let i = activeFrameI + 1; i < frames.length; ++i)
  {
    frames[i].classList.add('off');
  }

  frames[activeFrameI].classList.remove('off');

  focusActiveApp();
}

function switchToApp(newApp)
{
  const frames = $all('iframe');

  for (let i = 0; i < frames.length; ++i)
  {
    const frame = frames[i];

    frame.classList.toggle('off', frame.dataset.app !== newApp);
  }

  focusActiveApp();
}

function handleAppsMessage(msg, app, src)
{
  const apps = Object.keys(readyApps).filter(a => a !== app);

  src.postMessage({type: 'apps', data: {apps}}, '*');
}

function handleLocalStorageMessage(msg, app, src)
{
  if (msg.action === 'read')
  {
    return src.postMessage({type: 'localStorage', data: LOCAL_STORAGE[app] || {}}, '*');
  }

  if (msg.action === 'write')
  {
    LOCAL_STORAGE[app] = msg.data;
  }
  else if (msg.action === 'clear')
  {
    LOCAL_STORAGE[app] = {};
  }
  else if (msg.action === 'removeItem')
  {
    delete LOCAL_STORAGE[app][msg.key];
  }
  else if (msg.action === 'setItem')
  {
    if (!LOCAL_STORAGE[app])
    {
      LOCAL_STORAGE[app] = {};
    }

    LOCAL_STORAGE[app][msg.key] = msg.value;
  }

  msg.app = app;

  const xhr = new XMLHttpRequest();

  xhr.timeout = 5000;

  xhr.open('POST', `${window.location.origin}/localStorage/${msg.action}`, true);
  xhr.send(JSON.stringify(msg));
}

function handleRefreshMessage()
{
  focusActiveApp();

  window.location.reload();
}

function focusActiveApp()
{
  const frames = $all('iframe');

  for (let i = 0; i < frames.length; ++i)
  {
    const frame = frames[i];

    if (!frame.classList.contains('off'))
    {
      sessionStorage.setItem('NEXT_ACTIVE_APP_ID', frame.dataset.app);

      frame.contentWindow.focus();
    }
  }
}

function start()
{
  startTries += 1;

  console.log(`Starting ${startTries}...`);

  if (startTries === 4)
  {
    return loadApps();
  }

  getRemoteTime(remoteTime =>
  {
    if (remoteTime <= 0)
    {
      return setTimeout(start, 10000);
    }

    const diff = Date.now() - remoteTime;

    if (Math.abs(diff) > CLOCK_DIFF)
    {
      console.log(`Clock desynced by ${diff}. Syncing clock...`);

      return syncClock();
    }

    console.log('Clock synced!');

    loadApps();
  });
}

async function getRemoteTime(done)
{
  try
  {
    const res = await requestRemote(`/wmes/clients;time`, {timeout: 5000});
    const {time} = await res.json();

    done(time);
  }
  catch (err)
  {
    console.error(`Failed to get the remote time: ${err.message}`);
    done(0);
  }
}

function syncClock()
{
  const xhr = new XMLHttpRequest();

  xhr.timeout = 45000;

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState !== XMLHttpRequest.DONE)
    {
      return;
    }

    if (xhr.status !== 204)
    {
      console.log('Failed to sync clock:', xhr);

      return setTimeout(start, 10000);
    }

    waitForClockSync(Date.now());
  };

  xhr.open('POST', `${window.location.origin}/syncClock`, true);
  xhr.send();
}

function waitForClockSync(waitSince)
{
  if (Date.now() - waitSince > 60000)
  {
    return syncClock();
  }

  getRemoteTime(remoteTime =>
  {
    if (remoteTime <= 0)
    {
      return setTimeout(start, 10000);
    }

    const diff = Date.now() - remoteTime;

    if (Math.abs(diff) < CLOCK_DIFF)
    {
      console.log('Clock synced!');

      return loadApps();
    }

    console.log(`Clock not synced yet: ${diff}`);

    setTimeout(waitForClockSync, 10000, waitSince);
  });
}

function loadApps()
{
  console.log(`Loading apps...`);

  const frames = $('#frames').children;

  for (let i = 0; i < frames.length; ++i)
  {
    const frame = frames[i];
    const app = frame.dataset.app;

    if (readyApps[app])
    {
      console.log(`App ${app} is ready!`);

      continue;
    }

    console.log(`Loading app: ${app}...`);

    frame.src = 'about:blank';

    if (app === 'xiconf')
    {
      frame.src = `http://local.wmes.pl:1337/`;
    }
    else if (app === 'snf')
    {
      frame.src = `http://local.wmes.pl:1338/`;
    }
    else if (app === 'horti')
    {
      frame.src = `http://local.wmes.pl:1339/`;
    }
    else if (app === 'remote'
      && typeof CONFIG.remote === 'string'
      && CONFIG.remote.startsWith('http'))
    {
      frame.src = CONFIG.remote;

      const matches = CONFIG.remote.match(/ready=([0-9]+)/i);

      if (matches)
      {
        setTimeout(() => handleReadyMessage({}, 'remote'), +matches[1] * 1000);
      }
    }
    else
    {
      frame.src = `https://${CONFIG.domain}/${app}`;
    }
  }

  if (Object.keys(readyApps).length !== CONFIG.apps.length)
  {
    setTimeout(loadApps, 60000);
  }

  scheduleClientUpdate(true);
}

function hideOverlay()
{
  const overlayEl = $('#overlay');

  if (overlayEl.classList.contains('is-config'))
  {
    return;
  }

  const activeApp = sessionStorage.getItem('NEXT_ACTIVE_APP_ID');
  let app = Object.keys(readyApps)[0];

  if (activeApp && readyApps[activeApp])
  {
    app = activeApp;

    sessionStorage.removeItem('NEXT_ACTIVE_APP_ID');
  }
  else if (readyApps.operator)
  {
    app = 'operator';
  }

  var iframeEl = $(`iframe[data-app="${app}"]`);

  if (iframeEl)
  {
    iframeEl.classList.remove('off');
  }

  overlayEl.classList.add('hidden');

  clearInterval(spinner);
}

function toggleConfig()
{
  const overlayEl = $('#overlay');

  if (overlayEl.classList.contains('is-config'))
  {
    return window.location.reload();
  }

  overlayEl.classList.add('is-config');
  overlayEl.classList.remove('hidden');

  for (let el of $all('iframe'))
  {
    el.classList.add('off');
  }

  updateConfig();
  setUpProdLines();
}

function updateConfig()
{
  const hostEl = $('input[name="host"][value="' + CONFIG.host + '"]');

  if (hostEl)
  {
    hostEl.checked = true;
  }

  const orientationEl = $('input[name="orientation"][value="' + CONFIG.orientation + '"]');

  if (orientationEl)
  {
    orientationEl.checked = true;
  }

  for (let el of $all('input[name="apps"]'))
  {
    el.checked = CONFIG.apps.includes(el.value);
  }

  $all('.config-value').forEach(input =>
  {
    if (typeof CONFIG[input.name] !== 'undefined')
    {
      input.value = CONFIG[input.name];
    }
  });

  toggleStationValidity();
}

function togglePowerOptions()
{
  var el = $('#powerOptions');

  el.classList.toggle('hidden');

  if (!el.classList.contains('hidden'))
  {
    devMenuCounter += 1;
  }

  el.classList.toggle('dev', devMenuCounter >= 3);

  clearTimeout(devMenuTimer);
  devMenuTimer = setTimeout(() => devMenuCounter = 0, 2000);
}

async function saveConfig(e)
{
  e.preventDefault();

  const newConfig = {
    domain: '',
    host: null,
    apps: [],
    remote: '',
    staticIp: '',
    line: '',
    station: 0,
    orientation: $(`input[name="orientation"]:checked`).value
  };

  for (let el of $all('.config-value'))
  {
    newConfig[el.name] = el.type === 'number' ? +el.value : el.value;
  }

  const hostEl = $(`input[name="host"]:checked`);

  if (hostEl)
  {
    newConfig.host = hostEl.value;
  }

  for (let el of $all(`input[name="apps"]:checked`))
  {
    newConfig.apps.push(el.value);
  }

  console.log(`Saving new config:`, newConfig);

  try
  {
    const res = await request('/config', {json: newConfig});

    if (res.status === 200)
    {
      console.log('Config saved!');
    }
    else
    {
      console.log(`Failed to save config: unexpected response status code!`);
    }
  }
  catch (err)
  {
    console.log(`Failed to save config: ${err.message}`);
  }

  sessionStorage.removeItem('WMES_CLIENT_LAST_UPDATE_AT');

  window.location.reload();
}

function reboot()
{
  console.log('Reboot...');

  request('/reboot', {method: 'POST'});
}

function shutdown()
{
  console.log('Shutdown...');

  request('/shutdown', {method: 'POST'});
}

function resetBrowser()
{
  console.log('Resetting browser...');

  request('/resetBrowser', {method: 'POST'});
}

function restartBrowser()
{
  console.log('Restarting browser...');

  request('/restartBrowser', {method: 'POST'});
}

function noKiosk()
{
  console.log('Requesting no kiosk...');

  request('/noKiosk', {method: 'POST'});
}

async function resolveHost()
{
  for (let el of $all('input[name="host"]'))
  {
    const host = el.value;

    console.log(`Resolving host: ${host}...`);

    try
    {
      const res = await requestRemote(`https://${host}/wmes/clients/${CLIENT._id}`, {
        timeout: 2000,
        method: 'PUT',
        json: CLIENT
      });

      if (res.status === 204)
      {
        el.checked = true;

        setUpProdLines();
        reloadNetworkInterfaces();

        return;
      }

      if (res.status === 200)
      {
        const {config} = await res.json();

        Object.assign(CONFIG, config);
        updateConfig();

        el.checked = true;

        setUpProdLines();
        reloadNetworkInterfaces();

        return;
      }
    }
    catch (err)
    {
      console.log(`Failed to resolve host: ${host}: ${err.message}`);
    }
  }

  if (!$('input[name="host"]:checked'))
  {
    setTimeout(resolveHost, 5000);
  }
}

function requestRemote(resource, options = {})
{
  if (resource.startsWith('/'))
  {
    resource = `https://${CONFIG.domain}${resource}`;
  }

  if (!options.headers)
  {
    options.headers = {};
  }

  options.headers['X-API-KEY'] = API_KEY;

  return request(resource, options);
}

function request(resource, options = {})
{
  if (resource.startsWith('/'))
  {
    resource = window.location.origin + resource;
  }

  const init = {
    method: 'GET',
    headers: {},
    mode: 'cors',
    redirect: 'manual',
    cache: 'no-store',
    referer: 'client',
    credentials: 'include',
    ...options
  };

  let timeoutId = null;

  if (init.timeout)
  {
    const abortController = new AbortController();

    init.signal = abortController.signal;

    timeoutId = setTimeout(() => abortController.abort(), init.timeout);

    delete init.timeout;
  }

  if (init.json)
  {
    if (init.method === 'GET')
    {
      init.method = 'POST';
    }

    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(init.json);

    delete init.json;
  }

  return new Promise((resolve, reject) =>
  {
    fetch(resource, init)
      .then(resolve, reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

function scheduleClientUpdate(force)
{
  clearTimeout(scheduleClientUpdate.timer);
  scheduleClientUpdate.timer = null;

  const lastUpdateAt = parseInt(sessionStorage.getItem('WMES_CLIENT_LAST_UPDATE_AT'), 10) || 0;
  const now = Date.now();

  if (!force && Date.now() - lastUpdateAt < 3600 * 1000)
  {
    scheduleClientUpdate.timer = setTimeout(scheduleClientUpdate, 3600 * 1000);

    return;
  }

  sessionStorage.setItem('WMES_CLIENT_LAST_UPDATE_AT', now.toString());

  updateClient();
}

async function updateClient()
{
  try
  {
    const localReq = await request(`/client.json`, {
      timeout: 2000
    });

    if (localReq.status === 200)
    {
      const body = await localReq.json();

      Object.assign(CLIENT, body);

      updateNetworkInterfaces();
    }
    else
    {
      throw new Error(`Unexpected local response status: ${localReq.status}`);
    }

    const remoteReq = await requestRemote(`/wmes/clients/${CLIENT._id}`, {
      timeout: 10000,
      method: 'PUT',
      json: CLIENT
    });

    if (remoteReq.status >= 200 && remoteReq.status < 300)
    {
      const body = remoteReq.status === 204 ? CLIENT : await remoteReq.json();

      console.log(`Updated the client info: `, body);
    }
    else
    {
      throw new Error(`Unexpected remote response status: ${remoteReq.status}`);
    }
  }
  catch (err)
  {
    console.error(`Failed to update the client info: ${err.message}`);
  }

  scheduleClientUpdate();
}

async function setUpProdLines()
{
  if ($('select[name="line"]'))
  {
    return;
  }

  const hostEl = $('input[name="host"]:checked');

  if (!hostEl)
  {
    return;
  }

  try
  {
    const res = await requestRemote(`https://${hostEl.value}/prodLines?deactivatedAt=null`, {
      timeout: 5000
    });

    if (res.status === 200)
    {
      const body = await res.json();

      var inputEl = $('input[name="line"]');
      var selectEl = document.createElement('select');

      selectEl.append(document.createElement('option'));

      body.collection.forEach(prodLine =>
      {
        var optionEl = document.createElement('option');

        optionEl.value = prodLine._id;
        optionEl.textContent = prodLine._id;
        optionEl.selected = prodLine._id === inputEl.value;

        selectEl.appendChild(optionEl);
      });

      selectEl.name = 'line';
      selectEl.style.width = inputEl.style.width;
      selectEl.classList.add('config-value');

      inputEl.parentElement.appendChild(selectEl);
      inputEl.parentElement.removeChild(inputEl);

      toggleStationValidity();
    }
  }
  catch (err)
  {
    console.error(`Failed to fetch prod lines: ${err.message}`);
  }
}

function toggleStationValidity()
{
  const lineEl = $('.config-value[name="line"]');
  const stationEl = $('.config-value[name="station"]');
  const required = !!$('input[data-requires-station]:checked');

  lineEl.required = required;
  stationEl.required = required;
  stationEl.min = required ? 1 : 0;
}

function updateNetworkInterfaces()
{
  let html = '';

  Object.keys(CLIENT.networkInterfaces).forEach(id =>
  {
    const iface = CLIENT.networkInterfaces[id];
    const addresses = iface.addresses.length ? iface.addresses : ['?.?.?.?'];

    addresses.forEach(address =>
    {
      html += `<tr><td>${id}</td><td>${address}<td>${iface.mac}`;
    });
  });

  $('#networkInterfaces').innerHTML = html;

  scheduleNetworkInterfacesUpdate();
}

async function reloadNetworkInterfaces()
{
  try
  {
    const res = await request(`/client.json`, {
      timeout: 2000
    });

    if (res.status === 200)
    {
      const body = await res.json();

      const oldValue = JSON.stringify(CLIENT.networkInterfaces);
      const newValue = JSON.stringify(body.networkInterfaces);

      CLIENT.networkInterfaces = body.networkInterfaces;

      updateNetworkInterfaces();

      if (newValue !== oldValue)
      {
        scheduleClientUpdate(true);
      }
    }
  }
  catch (err)
  {
    console.error(`Failed to reload network interfaces: ${err.message}`);
  }

  scheduleNetworkInterfacesUpdate();
}

function scheduleNetworkInterfacesUpdate()
{
  clearTimeout(scheduleNetworkInterfacesUpdate.timer);
  scheduleNetworkInterfacesUpdate.timer = setTimeout(reloadNetworkInterfaces, 30000);
}
