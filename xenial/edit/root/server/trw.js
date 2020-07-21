'use strict';

const step = require('h5.step');
const {list, Master} = require('pololu');
const SerialPort = require('serialport');

let queue = null;
let master = null;

exports.handleRequest = (req, res) =>
{
  if (req.socket.remoteAddress !== '127.0.0.1')
  {
    res.writeHead(403);
    res.end();

    return;
  }

  if (req.url === '/trw/setIo')
  {
    return enqueue(setIo, req, res);
  }

  if (req.url === '/trw/getIo')
  {
    return enqueue(getIo, req, res);
  }

  res.writeHead(404);
  res.end();
};

function enqueue(action, req, res)
{
  if (queue)
  {
    queue.push({action, req, res});

    return;
  }

  queue = [];

  act(0, action, req, res);
}

function act(retryCount, action, req, res)
{
  action(req, (err, result) =>
  {
    if (err && retryCount < 3)
    {
      return setImmediate(act, retryCount + 1, action, req, res);
    }

    if (err)
    {
      result = {error: {message: err.message}};
    }
    else if (!result)
    {
      result = {};
    }

    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(result));

    const nextAction = queue.shift();

    if (nextAction)
    {
      setImmediate(act, 0, nextAction.action, nextAction.req, nextAction.res);
    }
    else
    {
      queue = null;
    }
  });
}

function setIo(req, done)
{
  step(
    function()
    {
      getMaster(this.parallel());
      getBody(req, this.parallel());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const outputs = req.body.outputs;

      if (!Array.isArray(outputs) || outputs.length === 0)
      {
        return this.skip(new Error('Invalid outputs.'));
      }

      const deviceToTargets = {};

      outputs.forEach(output =>
      {
        if (!deviceToTargets[output.device])
        {
          deviceToTargets[output.device] = [];
        }

        deviceToTargets[output.device].push({
          channel: output.channel,
          target: output.value
        });
      });

      const requests = [];

      Object.keys(deviceToTargets).forEach(device =>
      {
        const targets = deviceToTargets[device];

        device = +device;

        targets.sort((a, b) => a.channel - b.channel);

        targets.forEach(({channel, target}) =>
        {
          const prevRequest = requests[requests.length - 1];

          if (!prevRequest || device !== prevRequest.device)
          {
            requests.push({
              device,
              channel,
              targets: [target]
            });

            return;
          }

          const prevChannel = prevRequest.channel + prevRequest.targets.length - 1;
          const channelDiff = channel - prevChannel;

          if (channelDiff !== 1)
          {
            requests.push({
              device,
              channel,
              targets: [target]
            });

            return;
          }

          prevRequest.targets.push(target);
        });
      });

      setNextIo(requests, this.next());
    },
    done
  );
}

function setNextIo(requests, done)
{
  if (!requests.length)
  {
    return done();
  }

  const request = requests.shift();

  master.trySetMultipleTargets(request)
    .then(() =>
    {
      setImmediate(setNextIo, requests, done);
    })
    .catch(err =>
    {
      done(err);
    });
}

function getIo(req, done)
{
  step(
    function()
    {
      getMaster(this.parallel());
      getBody(req, this.parallel());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const inputs = req.body.inputs;

      if (!Array.isArray(inputs) || inputs.length === 0)
      {
        return this.skip(new Error('Invalid inputs.'));
      }

      const deviceToChannels = {};

      inputs.forEach(input =>
      {
        if (!deviceToChannels[input.device])
        {
          deviceToChannels[input.device] = [];
        }

        deviceToChannels[input.device].push(input.channel);
      });

      const requests = [];

      Object.keys(deviceToChannels).forEach(device =>
      {
        requests.push({
          device: +device,
          channels: deviceToChannels[device]
        });
      });

      getNextIo(requests, {}, this.next());
    },
    done
  );
}

function getNextIo(requests, result, done)
{
  if (!requests.length)
  {
    return done(null, result);
  }

  const request = requests.shift();

  master.getMultiplePositions(request)
    .then(positions =>
    {
      result[request.device] = positions;

      setImmediate(getNextIo, requests, result, done);
    })
    .catch(err =>
    {
      done(err);
    });
}

function getBody(req, done)
{
  if (req.body)
  {
    return done(null, req.body);
  }

  let body = '';

  req.on('data', chunk =>
  {
    body += chunk;
  });

  req.once('end', () =>
  {
    try
    {
      req.body = JSON.parse(body);

      done(null, req.body);
    }
    catch (err)
    {
      done(new Error(`Invalid request body: ${err.message}`));
    }
  });
}

function getMaster(done)
{
  step(
    function()
    {
      if (master && master.isOpen())
      {
        return this.skip(null, master);
      }

      list(this.next());
    },
    function(err, devices)
    {
      if (err)
      {
        return this.skip(new Error(`Failed to list devices: ${err.message}`));
      }

      const serials = Object.keys(devices);
      const device = devices[serials.find(serial => !!devices[serial].cmd)];

      if (!device)
      {
        return this.skip(new Error(`Command port not found.`));
      }

      const serialPort = new SerialPort(device.cmd, {
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none'
      });

      master = new Master({serialPort});

      const next = once(this.next());

      master.once('error', next);
      master.once('close', next);
      master.once('open', next);
    },
    function(err)
    {
      if (err)
      {
        return this.skip(new Error(`Failed to open the command port: ${err.message}`));
      }

      master.removeAllListeners();
      master.on('error', () => {});

      if (!master.isOpen())
      {
        return this.skip(new Error(`Failed to open the command port.`));
      }
    },
    function(err)
    {
      if (err)
      {
        master = null;
      }

      done(err);
    }
  )
}

function once(fn)
{
  let called = false;
  let result = undefined;

  return function()
  {
    if (called)
    {
      return result;
    }

    result = fn.apply(this, arguments);
    called = true;

    return result;
  };
}
