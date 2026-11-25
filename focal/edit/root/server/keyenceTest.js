'use strict';

const {execFile} = require('child_process');
const fs = require('fs');
const path = require('path');
const step = require('h5.step');

const FTP_DIR = '/root/ftp/KeyenceTest';
const FTP_CLEAN_RE = /\.(jpe?g|webp)$/i;
const JPEG_RE = /\.jpe?g$/i;
const IMAGE_WAIT_TIME = 10000;
const IMAGE_POLL_INTERVAL = 100;

let queue = null;

exports.handleRequest = (req, res) =>
{
  if (req.url === '/keyenceTest/trigger')
  {
    return enqueue(trigger, req, res);
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

  act(action, req, res);
}

function act(action, req, res)
{
  action(req, (err, result) =>
  {
    if (err)
    {
      result = {
        error: {message: err.message}
      };

      Object.keys(err).forEach(key => result.error[key] = err[key]);
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
      setImmediate(act, nextAction.action, nextAction.req, nextAction.res);
    }
    else
    {
      queue = null;
    }
  });
}

function trigger(req, done)
{
  step(
    function()
    {
      getBody(req, this.parallel());
      cleanFtp(this.parallel());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      const next = this.next();
      const args = Array.isArray(req.body.args) ? req.body.args : [];

      execFile('dotnet', ['/root/KeyenceTest/KeyenceTest.dll', ...args], (err, stdout, stderr) =>
      {
        if (err)
        {
          err.stdout = stdout;
          err.stderr = stderr;

          return next(err);
        }

        next(null, {stdout, stderr, image: null});
      });
    },
    function(err, result)
    {
      if (err)
      {
        return this.skip(err);
      }

      waitForImage(result, this.next());
    },
    done
  );
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
      req.body = JSON.parse(body) || {};

      done(null, req.body);
    }
    catch (err)
    {
      done(new Error(`Invalid request body: ${err.message}`));
    }
  });
}

function cleanFtp(done)
{
  step(
    function()
    {
      fs.readdir(FTP_DIR, this.next());
    },
    function(err, files)
    {
      if (err)
      {
        return this.skip(err.code === 'ENOENT' ? null : err);
      }

      files
        .filter(file => FTP_CLEAN_RE.test(file))
        .forEach(file =>
        {
          const next = this.group();

          fs.unlink(path.join(FTP_DIR, file), err =>
          {
            next(err && err.code !== 'ENOENT' ? err : null);
          });
        });
    },
    done
  );
}

function waitForImage(result, done)
{
  const deadline = Date.now() + IMAGE_WAIT_TIME;
  let lastFile = null;
  let lastSize = -1;

  checkImage();

  function checkImage()
  {
    findJpeg((err, file, size, complete) =>
    {
      if (err)
      {
        return done(err);
      }

      // The FTP upload may still be in progress, so only accept a file that ends with
      // the JPEG EOI marker and whose size did not change since the previous check.
      if (file && complete && file === lastFile && size === lastSize)
      {
        return convertImage(file, result, done);
      }

      lastFile = file;
      lastSize = size;

      if (Date.now() >= deadline)
      {
        return done(null, result);
      }

      setTimeout(checkImage, IMAGE_POLL_INTERVAL);
    });
  }
}

function findJpeg(done)
{
  let file = null;

  step(
    function()
    {
      fs.readdir(FTP_DIR, this.next());
    },
    function(err, files)
    {
      if (err)
      {
        return this.skip(err.code === 'ENOENT' ? null : err);
      }

      file = files.filter(file => JPEG_RE.test(file)).sort()[0];

      if (!file)
      {
        return this.skip();
      }

      file = path.join(FTP_DIR, file);

      fs.readFile(file, this.next());
    },
    function(err, jpeg)
    {
      if (err && err.code !== 'ENOENT')
      {
        return done(err);
      }

      if (!jpeg)
      {
        return done(null, null, 0, false);
      }

      const size = jpeg.length;
      const complete = size > 2 && jpeg[size - 2] === 0xFF && jpeg[size - 1] === 0xD9;

      done(null, file, size, complete);
    }
  );
}

function convertImage(jpegFile, result, done)
{
  const webpFile = jpegFile.replace(JPEG_RE, '.webp');

  step(
    function()
    {
      execFile('cwebp', ['-quiet', jpegFile, '-o', webpFile], this.next());
    },
    function(err)
    {
      if (err)
      {
        return this.skip(err);
      }

      fs.readFile(webpFile, this.next());
    },
    function(err, webp)
    {
      if (err)
      {
        return done(err);
      }

      result.image = webp.toString('base64');

      done(null, result);
    }
  );
}
