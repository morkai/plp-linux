'use strict';

const {BufferQueueReader} = require('h5.buffers');
const axios = require('axios');
const TcpConnection = require('./TcpConnection');

const MIN_ID_OCCURRENCES = 3;
const DEFAULT_BEAM_POWER = 22;
const NO_CODES_DELAY = 10;
const NEXT_READ_DELAY = 10;

const STX = 0x02;
const EOT = 0x04;
const ACK = 0x06;
const NAK = 0x15;

class BalluffBisProcessor
{
  constructor(controller)
  {
    this.readNext = this.readNext.bind(this);

    this.options = controller.options;
    this.logger = controller.logger;
    this.callback = null;
    this.connection = null;
    this.timers = {};
    this.stationI = -1;
    this.reader = new BufferQueueReader();
    this.stations = this.options.stations.map(station =>
    {
      return {
        no: station.stationNo,
        current: {
          id: '',
          count: 0,
          time: 0
        },
        candidate: {
          id: '',
          count: 0,
          time: 0
        }
      };
    });
    this.lastRead = [];
    this.wasConnected = true;
    this.connRefusedCount = 0;
  }

  destroy()
  {
    this.callback = null;

    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = {};

    if (this.connection)
    {
      this.connection.destroy();
      this.connection = null;
    }

    this.reader.skip(this.reader.length);
  }

  start(callback)
  {
    this.logger.info('Starting BIS processor...');

    this.callback = callback;

    this.connection = new TcpConnection({
      socketOptions: {
        host: this.options.processorIp,
        port: this.options.headPort
      },
      autoOpen: true,
      autoReconnect: true,
      minConnectTime: 2500,
      maxReconnectTime: 5000,
      noActivityTime: 5000,
      closeOnDestroy: true,
      suppressErrorsAfterDestroy: true
    });

    this.connection.on('open', this.onOpen.bind(this));
    this.connection.on('close', this.onClose.bind(this));
    this.connection.on('error', this.onError.bind(this));
    this.connection.on('data', this.onData.bind(this));
    this.connection.on('write', this.onWrite.bind(this));
  }

  onError(err)
  {
    if (this.wasConnected || err.code !== 'ECONNREFUSED')
    {
      this.logger.error(err, 'Connection error.');
    }

    if (err.code === 'ECONNREFUSED')
    {
      this.connRefusedCount += 1;

      if (this.connRefusedCount === 5)
      {
        this.restartProcessor();
      }
    }
  }

  onClose()
  {
    if (this.wasConnected)
    {
      this.logger.warn('Disconnected.');
    }

    this.wasConnected = false;
    this.stationI = -1;
    this.responseHandler = null;
  }

  onOpen()
  {
    this.logger.warn('Connected.');

    this.connRefusedCount = 0;
    this.stationI = -1;
    this.responseHandler = null;
    this.wasConnected = true;

    this.readKeepAlive();
  }

  onData(data)
  {
    if (0 && this.options.debug)
    {
      this.printFrame('RX: ', data);
    }

    if (this.responseHandler)
    {
      this.reader.push(data);

      this.responseHandler.call(this);
    }
  }

  onWrite(data)
  {
    if (0 && this.options.debug)
    {
      this.printFrame('TX: ', data);
    }
  }

  readKeepAlive()
  {
    this.logger.debug('Reading the keep-alive configuration...');

    this.request('=', this.handleReadKeepAlive1);
  }

  handleReadKeepAlive1()
  {
    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.request(Buffer.from([STX]), this.handleReadKeepAlive2);
    }
    else
    {
      this.logger.warn('Unexpected read keep-alive ACK response.', {
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  handleReadKeepAlive2()
  {
    if (this.reader.length === 9 && this.reader.readByte(0) === ACK)
    {
      if (this.reader.readByte(1) === 0x31)
      {
        this.logger.debug('Keep-alive already enabled.');

        this.readBeamPower(0);
      }
      else
      {
        this.logger.debug('Enabling the keep-alive...');

        this.setKeepAlive();
      }
    }
    else
    {
      this.logger.warn('Unexpected read keep-alive STX response.', {
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  setKeepAlive()
  {
    this.request('%1000005', this.handleSetKeepAlive1);
  }

  handleSetKeepAlive1()
  {
    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.request(Buffer.from([STX]), this.handleSetKeepAlive2);
    }
    else
    {
      this.logger.warn('Unexpected set keep-alive ACK response.', {
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  handleSetKeepAlive2()
  {
    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.logger.debug('Keep alive enabled. Reconnecting...');

      this.connection.destroy();
      this.connection = null;

      this.timers.start = setTimeout(this.start.bind(this), 2500, this.callback);
    }
    else
    {
      this.logger.warn('Unexpected set keep-alive STX response.', {
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  readBeamPower(stationI)
  {
    const station = this.options.stations[stationI];

    if (!station)
    {
      this.timers.readNext = setTimeout(this.readNext, 250);

      return;
    }

    this.logger.debug('Reading beam power...', {
      stationNo: station.stationNo,
      headNo: station.headNo
    });

    this.request(`o${station.headNo}`, this.handleReadBeamPower1.bind(this, stationI));
  }

  handleReadBeamPower1(stationI)
  {
    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.request(Buffer.from([STX]), this.handleReadBeamPower2.bind(this, stationI));
    }
    else
    {
      const {stationNo, headNo} = this.options.stations[stationI];

      this.logger.warn('Unexpected read beam power ACK response.', {
        stationNo,
        headNo,
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  handleReadBeamPower2(stationI)
  {
    const station = this.options.stations[stationI];

    if (this.reader.length === 4 && this.reader.shiftByte() === ACK)
    {
      const actualPower = Math.round(parseInt(`0x${this.reader.shiftString(2, 'ascii')}`, 16) / 4);
      const requiredPower = parseInt(station.beamPower, 10) || DEFAULT_BEAM_POWER;

      this.logger.debug('Beam power read.', {
        stationNo: station.stationNo,
        headNo: station.headNo,
        actualPower,
        requiredPower
      });

      if (actualPower === requiredPower)
      {
        this.readBeamPower(stationI + 1);
      }
      else
      {
        this.setBeamPower(stationI, requiredPower);
      }
    }
    else
    {
      this.logger.warn('Unexpected read beam power STX response.', {
        stationNo: station.stationNo,
        headNo: station.headNo,
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  setBeamPower(stationI, requiredPower)
  {
    const station = this.options.stations[stationI];
    const power = (requiredPower * 4).toString(16).padStart(2, '0').toUpperCase();

    this.logger.debug('Setting beam power.', {
      stationNo: station.stationNo,
      headNo: station.headNo,
      requiredPower,
      sentPower: power
    });

    this.request(`p${station.headNo}${power}`, this.handleSetBeamPower1.bind(this, stationI));
  }

  handleSetBeamPower1(stationI)
  {
    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.request(Buffer.from([STX]), this.handleSetBeamPower2.bind(this, stationI));
    }
    else
    {
      const {stationNo, headNo} = this.options.stations[stationI];

      this.logger.warn('Unexpected set beam power ACK response.', {
        stationNo,
        headNo,
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  handleSetBeamPower2(stationI)
  {
    const station = this.options.stations[stationI];

    if (this.reader.length === 2 && this.reader.readByte(0) === ACK && this.reader.readByte(1) === 0x30)
    {
      this.logger.debug('Beam power set.', {
        stationNo: station.stationNo,
        headNo: station.headNo
      });

      this.readBeamPower(stationI + 1);
    }
    else
    {
      const {stationNo, headNo} = this.options.stations[stationI];

      this.logger.warn('Unexpected set beam power STX response.', {
        stationNo,
        headNo,
        response: this.reader.readBuffer(this.reader.length)
      });
    }
  }

  readNext()
  {
    clearTimeout(this.timers.readNext);
    this.timers.readNext = null;

    const {stations} = this.options;

    this.lastRead = [];
    this.stationI += 1;

    if (this.stationI === stations.length)
    {
      this.stationI = 0;
    }

    const station = stations[this.stationI];

    if (this.options.debug)
    {
      this.logger.debug('Reading code...', {
        stationNo: station.stationNo,
        headNo: station.headNo
      })
    }

    this.request(`M${station.headNo}T0030`, this.handleDataAck);
  }

  request(frame, responseHandler)
  {
    if (!this.connection || !this.connection.isOpen())
    {
      return;
    }

    this.responseHandler = responseHandler;

    this.reader.skip(this.reader.length);

    this.connection.write(Buffer.isBuffer(frame) ? frame : this.frame(frame));
  }

  frame(ascii)
  {
    const buf = Buffer.from(ascii + '0');

    buf[buf.length - 1] = this.bcc(buf);

    return buf;
  }

  bcc(buf)
  {
    let bcc = 0;

    if (buf instanceof BufferQueueReader)
    {
      for (let i = 0; i < buf.length - 1; ++i)
      {
        bcc = bcc ^ buf.readByte(i);
      }
    }
    else
    {
      for (let i = 0; i < buf.length - 1; ++i)
      {
        bcc = bcc ^ buf[i];
      }
    }

    return bcc;
  }

  handleDataAck()
  {
    const length = this.reader.length;

    if (length < 1)
    {
      return;
    }

    const status = this.reader.readByte(0);

    if (length === 2 && status === NAK)
    {
      if (this.options.debug)
      {
        this.logger.debug('Read no codes.', {
          stationNo: this.stations[this.stationI].no
        })
      }

      this.timers.readNext = setTimeout(this.readNext, NO_CODES_DELAY);

      return;
    }

    if (length === 9 && status === ACK)
    {
      this.request(Buffer.from([STX]), this.handleDataChunk);
    }
  }

  handleDataChunk()
  {
    const status = this.reader.readByte(0);

    if ((status === ACK || status === EOT) && ((this.reader.length - 15) % 66 === 0))
    {
      const expectedChecksum = this.reader.readByte(this.reader.length - 1);
      const actualChecksum = this.bcc(this.reader);

      if (actualChecksum !== expectedChecksum)
      {
        if (this.options.debug)
        {
          this.logger.debug('Invalid checksum.', {
            stationNo: this.stations[this.stationI].no,
            expectedChecksum,
            actualChecksum,
            buffer: this.reader.shiftBuffer(this.reader.length)
          });
        }

        this.timers.readNext = setTimeout(this.readNext, NO_CODES_DELAY);

        return;
      }

      this.reader.skip(14);

      while (this.reader.length > 66)
      {
        this.reader.skip(2);

        const dataLength = this.reader.shiftByte();

        this.reader.skip(1);

        const data = this.reader.shiftBuffer(62);
        let id = '';

        for (let i = 1; i <= dataLength; ++i)
        {
          id += data[62 - i].toString(16).toUpperCase().padStart(2, '0');
        }

        if (this.options.carts.has(id))
        {
          id = this.options.carts.get(id);
        }

        if (!this.lastRead.includes(id))
        {
          this.lastRead.push(id);
        }
      }
    }

    if (status === ACK)
    {
      this.request(Buffer.from([STX]), this.handleDataChunk);

      return;
    }

    this.handleData();

    this.timers.readNext = setTimeout(this.readNext, NEXT_READ_DELAY);
  }

  handleData()
  {
    const station = this.stations[this.stationI];

    if (!this.lastRead.length)
    {
      if (this.options.debug)
      {
        this.logger.debug('Read no codes.', {
          stationNo: station.no
        });
      }

      return;
    }

    this.lastRead.sort();

    if (this.lastRead.includes(station.current.id))
    {
      if (this.options.debug)
      {
        this.logger.debug('Read the same code.', {
          stationNo: station.no,
          lastRead: this.lastRead
        });
      }

      station.current.count += 1;

      return;
    }

    if (this.lastRead.length > 1)
    {
      if (this.options.debug)
      {
        this.logger.debug('Read multiple codes.', {
          stationNo: station.no,
          lastRead: this.lastRead
        });
      }

      return;
    }

    if (this.lastRead[0] === station.candidate.id || this.lastRead.includes(station.candidate.id))
    {
      station.candidate.count += 1;

      if (station.candidate.count === MIN_ID_OCCURRENCES)
      {
        station.current = {...station.candidate};

        if (this.options.debug)
        {
          this.logger.debug('Read new code.', {
            station,
            lastRead: this.lastRead
          });
        }

        if (this.callback)
        {
          this.callback(station.no, station.current);
        }
      }
      else if (this.options.debug)
      {
        this.logger.debug('Read matching candidate code.', {
          stationNo: station.no,
          lastRead: this.lastRead
        });
      }
    }
    else if (this.lastRead.length === 1)
    {
      station.candidate.id = this.lastRead[0];
      station.candidate.count = 1;
      station.candidate.time = Date.now();

      if (this.options.debug)
      {
        this.logger.debug('Read new candidate code.', {
          station,
          lastRead: this.lastRead
        });
      }
    }
    else if (this.options.debug)
    {
      this.logger.debug('Read ignored.', {
        stationNo: station.no,
        lastRead: this.lastRead
      });
    }
  }

  async restartProcessor()
  {
    this.logger.debug('Restarting the processor controller...');

    try
    {
      const res = await axios({
        method: 'POST',
        url: `http://${this.options.processorIp}/reset`,
        headers: {
          'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client',
          'Authorization': 'Basic YWRtaW46cmU=',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': '8'
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: null,
        data: 'cnf=true'
      });

      if (res.status !== 200)
      {
        throw Object.assign(new Error('Invalid response status.'), {
          expectedStatus: 200,
          actualStatus: res.status
        });
      }

      this.logger.info('Restarted the processor controller.');
    }
    catch (err)
    {
      delete err.request;
      delete err.response;

      this.logger.error(err, 'Failed to restart the processor controller.');
    }
    finally
    {
      this.connRefusedCount = 0;
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

module.exports = BalluffBisProcessor;
