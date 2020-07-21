'use strict';

const logger = require('h5.logger');
const {BufferQueueReader} = require('h5.buffers');
const TcpConnection = require('./TcpConnection');

const MIN_ID_OCCURENCES = 3;

const STX = 0x02;
const EOT = 0x04;
const ACK = 0x06;
const NAK = 0x15;

class BalluffProcessorController
{
  constructor(options)
  {
    this.options = options;

    this.callback = null;
    this.connection = null;
    this.timers = {};
    this.stationI = -1;
    this.reader = new BufferQueueReader();
    this.stations = options.stations.map(station =>
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

    this.logger = logger.create({
      module: 'ct-balluff',
      submodule: `${options.processorIp}:${options.headPort}`
    });
  }

  destroy()
  {
    this.logger.info('Destroying...');

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
    this.logger.info('Connecting...');

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
    this.logger.error(err, 'Connection error.');
  }

  onClose()
  {
    this.logger.warn('Disconnected.');

    this.stationI = -1;
    this.responseHandler = null;
  }

  onOpen()
  {
    this.logger.warn('Connected.');

    this.stationI = -1;
    this.responseHandler = null;

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

        this.readNext();
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

  readNext()
  {
    clearTimeout(this.timers.readNext);

    const {stations} = this.options;

    this.lastRead = [];
    this.stationI += 1;

    if (this.stationI === this.options.stations.length)
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

      this.timers.readNext = setTimeout(this.readNext.bind(this), 100);

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

        this.timers.readNext = setTimeout(this.readNext.bind(this), 100);

        return;
      }

      this.reader.skip(14);

      while (this.reader.length > 66)
      {
        this.reader.skip(2);

        const dataLength = this.reader.shiftByte();

        this.reader.skip(1);

        const data = this.reader.shiftBuffer(62);
        const id = [];

        for (let i = 1; i <= dataLength; ++i)
        {
          id.push(data[62 - i].toString(16).toUpperCase().padStart(2, '0'));
        }

        this.lastRead.push(id.join(''));
      }
    }

    if (status === ACK)
    {
      this.request(Buffer.from([STX]), this.handleDataChunk);

      return;
    }

    this.handleData();

    this.timers.readNext = setTimeout(this.readNext.bind(this), 100);
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

      if (station.candidate.count === MIN_ID_OCCURENCES)
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
