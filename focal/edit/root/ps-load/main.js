'use strict';

const {execSync, readFileSync, spawn} = require('child_process');
const {writeFile} = require('fs');
const axios = require('axios');

const config = {
  secretKey: '?',
  pinNumber: 31,
  edge: 'FALLING',
  domain: 'wmes.pl',
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

    setTimeout(start, 5000);
  });

  mraa.on('close', () =>
  {
    console.log('mraa-gpio closed.');

    setTimeout(start, 5000);
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

async function publish()
{
  if (publishing)
  {
    return;
  }

  const items = buffer;

  buffer = [];

  publishing = true;

  try
  {
    await axios.post(`https://${config.domain}/paintShop/load/update`, {
      secretKey: config.secretKey,
      items
    });

    writeFile(`${__dirname}/buffer.json`, '[]', () => {});

    publishing = false;

    if (buffer.length)
    {
      setImmediate(publish);
    }
  }
  catch (err)
  {
    console.log(`Failed to publish: ${err.message}`);

    buffer = items.concat(buffer);

    writeFile(`${__dirname}/buffer.json`, JSON.stringify(buffer), () =>
    {
      publishing = false;

      setTimeout(publish, 5000);
    });
  }
}
