'use strict';

const {execSync} = require('child_process');
const {writeFile} = require('fs');
const {fetchUrl} = require('fetch');

const config = {
  secretKey: '?',
  pinNumber: 31,
  edge: 'FALLING',
  host: '127.0.0.1',
  maxDuration: 8 * 3600 * 1000
};
let pin = null;
let lastAt = 0;
let publishing = false;
let buffer = [];

try { buffer = JSON.stringify(fs.readFileSync(`${__dirname}/buffer.json`, 'utf8')); }
catch (err) {}

if (!execSync(`uname -a`).includes('upboard'))
{
  idle();
}
else
{
  start();
}

function idle()
{
  setInterval(() => {}, 1337);
}

function start()
{
  const mraa = require('mraa');

  Object.assign(
    config,
    require(`./16.04/edit/root/server.json`),
    require(`./16.04/edit/root/ps-load/config.json`)
  );

  pin = new mraa.Gpio(config.pinNumber);

  pin.dir(mraa.DIR_IN);
  pin.isr(mraa[`EDGE_${config.edge}`], monitor);

  if (buffer.length)
  {
    publish();
  }

  idle();
}

function monitor()
{
  const state = pin.read();

  if ((config.edge === 'RISING' && state === 0) || (config.edge === 'FALLING' && state === 1))
  {
    return;
  }

  const now = Date.now();
  const duration = now - lastAt;

  if (duration < 1000)
  {
    return;
  }

  buffer.push({
    _id: new Date(now),
    d: duration >= config.maxDuration ? 0 : duration
  });

  lastAt = now;

  publish();
}

function publish()
{
  if (publishing)
  {
    return;
  }

  const items = buffer;

  buffer = [];
  publishing = true;

  fetchUrl(`http://${config.host}/paintShop/load/update`, {
    method: 'POST',
    timeout: 10000,
    maxRedirects: 3,
    disableGzip: true,
    headers: {'Content-Type': 'application/json'},
    payload: JSON.stringify({
      secretKey: config.secretKey,
      items
    })
  }, (err, meta) =>
  {
    const status = meta ? meta.status : 0;

    if (status !== 204)
    {
      console.error(`Failed to publish: ${err ? err.message : `invalid status: ${status}`}`);

      buffer = items.concat(buffer);

      writeFile(`${__dirname}/buffer.json`, JSON.stringify(buffer), () =>
      {
        publishing = false;

        setTimeout(publish, 5000);
      });
    }
    else
    {
      writeFile(`${__dirname}/buffer.json`, '[]', () => {});

      publishing = false;

      if (buffer.length)
      {
        setImmediate(publish);
      }
    }
  });
}
