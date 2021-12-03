'use strict';

const logger = require('h5.logger');
const axios = require('axios');
const BalluffBisProcessor = require('./BalluffBisProcessor');
const BalluffBniProcessor = require('./BalluffBniProcessor');

class BalluffProcessorController
{
  constructor(options)
  {
    this.options = options;

    this.logger = logger.create({
      module: 'ct-balluff',
      submodule: `${options.processorIp}:${options.headPort}`
    });

    this.timers = {};

    this.processor = null;
  }

  destroy()
  {
    this.logger.info('Destroying...');

    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = {};

    if (this.processor)
    {
      this.processor.destroy();
      this.processor = null;
    }
  }

  async start(callback)
  {
    await this.resolveProcessor();

    if (this.processor)
    {
      this.processor.start(callback);
    }
    else
    {
      this.logger.warn('Cannot start: unknown model.');

      clearTimeout(this.timers.start);
      this.timers.start = setTimeout(this.start.bind(this, callback), 30000);
    }
  }

  async resolveProcessor()
  {
    this.logger.debug('Resolving the processor model...');

    if (this.processor)
    {
      this.processor.destroy();
      this.processor = null;
    }

    try
    {
      const res = await axios({
        method: 'GET',
        url: `http://${this.options.processorIp}/index.jsn`,
        headers: {
          'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client'
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: null
      });

      if (res.status !== 200)
      {
        throw Object.assign(new Error('Invalid response status.'), {
          expectedStatus: 200,
          actualStatus: res.status
        });
      }

      if (!Array.isArray(res.data) || !res.data.length || !res.data[0].IPConfig)
      {
        throw new Error('Invalid response data.');
      }

      if (typeof res.data[0].Product === 'string' && res.data[0].Product.includes('BNI'))
      {
        this.processor = new BalluffBniProcessor(this);
      }
      else if (typeof res.data[0].H1HeadName === 'string')
      {
        this.processor = new BalluffBisProcessor(this);
      }
    }
    catch (err)
    {
      delete err.request;
      delete err.response;

      this.logger.error(err, 'Failed to resolve the processor model.');
    }
  }

  printReader(prefix)
  {
    this.printFrame(prefix, this.reader.readBuffer(0, this.reader.length));
  }

  printFrame(prefix, frame)
  {
    const ascii = [];
    const hex = [];
    const buffer = Buffer.isBuffer(frame);

    for (let i = 0; i < frame.length; ++i)
    {
      const b = buffer ? frame[i] : frame.readByte(i);

      if (b >= 0x20 && b <= 0x7E)
      {
        ascii.push(String.fromCharCode(b).padStart(2, ' '));
      }
      else
      {
        ascii.push(b.toString(16).padStart(2, '0'));
      }

      hex.push(b.toString(16).padStart(2, '0'));
    }

    if (prefix)
    {
      console.log(prefix);
    }

    console.log(`${ascii.join(' ')}\n${hex.join(' ')}`);
  }
}

module.exports = BalluffProcessorController;
