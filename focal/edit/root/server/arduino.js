'use strict';

const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const step = require('h5.step');
const {BufferQueueReader} = require('h5.buffers');
const {SerialPort} = require('serialport');

let queue = null;
let serialPort = null;
let responseHandler = null;
let responseTimer = null;
const responseBuffer = new BufferQueueReader();

exports.handleRequest = (req, res) =>
{
  if (req.method === 'GET' && req.url === '/arduino/listBoards')
  {
    return handleListBoards(req, res);
  }

  if (req.method === 'POST' && req.url === '/arduino/upload')
  {
    return handleUpload(req, res);
  }

  if (req.method === 'POST' && req.url === '/arduino/runCmd')
  {
    return handleRunCmd(req, res);
  }

  res.writeHead(404);
  res.end();
};

function endRes(res, err, result)
{
  if (err)
  {
    result = {error: {message: err.message}};
  }
  else if (!result)
  {
    result = {};
  }

  res.writeHead(err ? (err.statusCode || 500) : 200, {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(result));
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

function handleListBoards(req, res)
{
  listArduinoBoards((err, arduinos) =>
  {
    endRes(res, err, arduinos ? {totalCount: arduinos.length, collection: arduinos} : null);
  });
}

function handleUpload(req, res)
{
  getBody(req, err =>
  {
    if (err)
    {
      return endRes(res, err);
    }

    enqueue(upload, req, res);
  });
}

function handleRunCmd(req, res)
{
  getBody(req, err =>
  {
    if (err)
    {
      return endRes(res, err);
    }

    enqueue(runCmd, req, res);
  });
}

function enqueue(action, req, res)
{
  if (queue)
  {
    queue.push({action, req, res});

    return;
  }

  queue = [];

  act(action, req, res);
}

function act(action, req, res)
{
  action(req, (err, result) =>
  {
    endRes(res, err, result);

    const nextAction = queue.shift();

    if (nextAction)
    {
      setImmediate(act, nextAction.action, nextAction.req, nextAction.res);
    }
    else
    {
      queue = null;
    }
  });
}

function upload(req, done)
{
  if (typeof req.body.hex !== 'string' || !req.body.hex.startsWith(':10'))
  {
    return done(new Error('Invalid HEX.'));
  }

  const inputFile = path.join(os.tmpdir(), `arduino-${Date.now()}.ino.hex`);

  step(
    function()
    {
      if (serialPort)
      {
        serialPort.close();

        setTimeout(this.next(), 1000);
      }
    },
    function()
    {
      listArduinoBoards(this.parallel());
      fs.writeFile(inputFile, req.body.hex, this.parallel());
    },
    function(err, arduinos)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (arduinos.length === 0)
      {
        return this.skip(new Error('Arduino not found.'));
      }

      let arduino;

      if (req.body.boardId)
      {
        arduino = arduinos.find(a => a._id === req.body.boardId);
      }

      if (!arduino)
      {
        if (arduinos.length > 1)
        {
          return this.skip(new Error('Multiple Arduinos found.'));
        }

        arduino = arduinos[0];
      }

      if (!arduino)
      {
        return this.skip(new Error('Arduino not found.'));
      }

      const cmd = [
        'arduino-cli --log --log-level trace --no-color',
        `--fqbn "${String(arduino.fqbn || req.body.fqbn)}"`,
        `--port "${arduino.port}"`,
        `--input-file "${inputFile}"`
      ];

      const next = this.next();

      exec(cmd.join(' '), {encoding: 'utf8'}, (error, stdout, stderr) =>
      {
        next(null, {error, stdout, stderr});
      });
    },
    function(err, result)
    {
      fs.unlink(inputFile, () => {});
      done(err, result);
    }
  );
}

function runCmd(req, done)
{
  const {cmd, timeout} = req.body;

  if (typeof cmd !== 'string' || cmd.length === 0 || cmd.length > 20)
  {
    return done(new Error('Invalid command.'));
  }

  step(
    function()
    {
      getSerialPort(this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      execCmd(cmd, timeout || 5000, this.next());
    },
    function(err, res)
    {
      if (err)
      {
        return done(err);
      }

      const parts = res.split(' ');
      const success = parts.shift() === '1';
      const message = parts.join(' ');

      if (success)
      {
        return done(null, {
          result: true,
          message: message || 'OK'
        });
      }

      done(null, {
        result: false,
        message: message || 'NOK'
      });
    }
  );
}

function getSerialPort(done)
{
  if (serialPort)
  {
    return done(null, serialPort);
  }

  step(
    function()
    {
      resolveSerialPortPath(this.next());
    },
    function(err, path)
    {
      if (err)
      {
        return this.skip(err);
      }

      setUpSerialPort(path, this.next());
    },
    function(err)
    {
      if (err)
      {
        return done(err);
      }

      done(null, serialPort);
    }
  );
}

function resolveSerialPortPath(done)
{
  listArduinoBoards((err, arduinos) =>
  {
    if (err)
    {
      return done(err);
    }

    if (arduinos.length === 0)
    {
      return done(new Error('Arduino not found.'));
    }

    if (arduinos.length > 1)
    {
      return done(new Error('Multiple Arduinos found.'));
    }

    done(null, arduinos[0].port);
  });
}

function listArduinoBoards(done)
{
  exec(`arduino-cli board list --json`, {encoding: 'utf8'}, (err, stdout, stderr) =>
  {
    if (stderr)
    {
      return done(new Error(`Failed to list Arduino boards: ${stderr.split('\n')[0]}`));
    }

    if (err)
    {
      return done(new Error(`Failed to list Arduino boards: ${err.message}`));
    }

    try
    {
      const boards = JSON.parse(stdout).detected_ports
        .filter(p =>
        {
          return (Array.isArray(p.matching_boards) && p.matching_boards.length > 0)
            || p.port.address.startsWith('/dev/ttyUSB')
            || p.port.address.startsWith('/dev/ttyACM');
        })
        .map(p => ({
          _id: p.port.hardware_id || null,
          fqbn: Array.isArray(p.matching_boards) ? p.matching_boards[0].fqbn : null,
          port: p.port.address
        }));

      done(null, boards);
    }
    catch (err)
    {
      done(new Error(`Failed to parse Arduino board list: ${err.message}`));
    }
  });
}

function pingSerialPort(done)
{
  execCmd('PING', 1000, (err, res) =>
  {
    if (err)
    {
      return done(err);
    }

    if (res !== '1 PONG')
    {
      return done(new Error(`Invalid PING response: ${res}`));
    }

    done();
  });
}

function setUpSerialPort(path, done)
{
  serialPort = new SerialPort({
    path,
    baudRate: 115200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  });

  const doneOnError = err => done(new Error(`Failed to open serial port: ${err.message}`));

  serialPort.once('error', doneOnError);

  serialPort.once('error', err =>
  {
    handleResponse(new Error(`Serial port error: ${err.message}`));
    tearDownSerialPort();
  });

  serialPort.once('close', () =>
  {
    handleResponse(new Error(`Serial port was closed.`));
    tearDownSerialPort();
  });

  serialPort.once('open', () =>
  {
    serialPort.removeListener('error', doneOnError);
    setTimeout(() => pingSerialPort(done), 2000);
  });

  serialPort.on('readable', () =>
  {
    if (!serialPort)
    {
      return;
    }

    const data = serialPort.read();

    if (!data)
    {
      return;
    }

    responseBuffer.push(data);

    const eofIndex = responseBuffer.indexOf(0x0A);

    if (eofIndex === -1)
    {
      return;
    }

    const res = responseBuffer.shiftString(eofIndex, 'ascii');

    handleResponse(null, res);
  });
}

function tearDownSerialPort()
{
  if (!serialPort)
  {
    return;
  }

  if (responseBuffer.length)
  {
    responseBuffer.skip();
  }

  serialPort.removeAllListeners();
  serialPort.on('error', () => {});
  serialPort.close();
  serialPort = null;
}

function handleResponse(err, res)
{
  if (responseTimer)
  {
    clearTimeout(responseTimer);
    responseTimer = null;
  }

  const handlerFn = responseHandler;

  responseHandler = null;

  if (handlerFn)
  {
    handlerFn(err, res);
  }
}

function execCmd(cmd, timeout, done)
{
  if (responseTimer)
  {
    clearTimeout(responseTimer);
  }

  responseHandler = done;

  responseTimer = setTimeout(
    () => handleResponse(new Error(`Command timeout: ${cmd}`)),
    timeout || 60000
  );

  if (responseBuffer.length)
  {
    responseBuffer.skip();
  }

  if (serialPort)
  {
    serialPort.write(Buffer.from(`${cmd}\n`));
  }
  else
  {
    handleResponse(new Error('No serial port.'));
  }
}
