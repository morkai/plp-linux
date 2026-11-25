'use strict';

const {execSync, spawn} = require('child_process');
const {writeFile, readFileSync} = require('fs');
const axios = require('axios');

const config = {
  secretKey: '?',
  pinNumber: 31,
  edge: 'FALLING',
  domain: 'wmes.pl',
  maxDuration: 8 * 3600 * 1000
};
let lastAt = 0;
let publishing = false;
let buffer = [];
let apiKey = null;
let startTimer = null;
let publishTimer = null;

try
{
  buffer = JSON.parse(readFileSync(`${__dirname}/buffer.json`, 'utf8'));
}
catch (err)
{
  console.log('Failed to read buffer.json: ' + err.message);
}

try { apiKey = readFileSync(`${__dirname}/../apikey.txt`, 'utf8').trim(); }
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
  clearTimeout(startTimer);

  Object.assign(
    config,
    require(`${__dirname}/../server/config.json`),
    require(`${__dirname}/config.json`)
  );

  console.log('mraa-gpio starting...', {config});

  const mraa = spawn('unbuffer', ['mraa-gpio', 'monitor', config.pinNumber.toString()]);

  mraa.stderr.setEncoding('utf8');
  mraa.stderr.on('data', data =>
  {
    process.stdout.write(data);
  });

  mraa.stdout.setEncoding('utf8');
  mraa.stdout.on('data', data =>
  {
    const matches = data.match(/Pin [0-9]+ = ([01])/);

    if (matches)
    {
      handleState(+matches[1]);
    }
  });

  mraa.on('error', err =>
  {
    console.error(`mraa-gpio error: ${err.message}`);

    clearTimeout(startTimer);
    startTimer = setTimeout(start, 5000);
  });

  mraa.on('close', () =>
  {
    console.log('mraa-gpio closed.');

    clearTimeout(startTimer);
    startTimer = setTimeout(start, 5000);
  });

  mraa.stdin.write('\n');

  if (buffer.length)
  {
    publish();
  }
}

function handleState(state)
{
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
  clearTimeout(publishTimer);

  if (publishing)
  {
    return Promise.resolve();
  }

  if (!buffer.length)
  {
    return;
  }

  const items = buffer;

  buffer = [];

  publishing = true;

  return Promise.resolve()
    .then(() =>
    {
      const headers = {};

      if (apiKey)
      {
        headers['x-api-key'] = apiKey;
      }

      return axios({
        method: 'POST',
        url: `https://${config.domain}/paintShop/load/update`,
        headers,
        data: {
          secretKey: config.secretKey,
          items
        }
      });
    })
    .then(() =>
    {
      writeFile(`${__dirname}/buffer.json`, '[]', () => {});

      publishing = false;

      if (buffer.length)
      {
        setImmediate(publish);
      }
    })
    .catch(err =>
    {
      console.log(`Failed to publish: ${err.message}`);

      buffer = items.concat(buffer);

      writeFile(`${__dirname}/buffer.json`, JSON.stringify(buffer), () =>
      {
        publishing = false;

        clearTimeout(publishTimer);
        publishTimer = setTimeout(publish, 5000);
      });
    });
}
