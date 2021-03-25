'use strict';

const axios = require('axios');

class BalluffBniProcessor
{
  constructor(controller)
  {
    this.options = controller.options;
    this.logger = controller.logger;
    this.callback = null;
    this.timers = {};
    this.stations = this.options.stations.map(station =>
    {
      return {
        no: station.stationNo,
        port: parseInt(station.headNo, 10) - 1,
        current: {
          id: '00000000',
          count: 0,
          time: 0
        }
      };
    });
    this.invalidPorts = 0;
  }

  destroy()
  {
    this.callback = null;

    Object.values(this.timers).forEach(timer => clearTimeout(timer));
    this.timers = {};
  }

  start(callback)
  {
    this.logger.info('Starting BNI processor...');

    this.callback = callback;
    this.invalidPorts = 0;

    this.read();
  }

  handleData(ids)
  {
    const time = Date.now();

    for (let i = 0; i < this.stations.length; ++i)
    {
      const id = ids[i];
      const station = this.stations[i];

      if (id === station.current.id)
      {
        continue;
      }

      station.current = {
        id,
        count: 1,
        time
      };

      if (this.callback)
      {
        this.callback(station.no, station.current);
      }
    }
  }

  async read()
  {
    clearTimeout(this.timers.read);
    this.timers.read = null;

    try
    {
      const res = await axios({
        method: 'GET',
        url: `http://${this.options.processorIp}/ports.jsn`,
        headers: {
          'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client'
        },
        timeout: 1000,
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

      if (!res.data || !Array.isArray(res.data.ports) || res.data.ports.length < this.stations.length)
      {
        throw new Error('Invalid response data.');
      }

      const ports = this.stations.map(station => res.data.ports[station.port]);

      if (ports.some(port => !port))
      {
        throw new Error('Missing port data.');
      }

      if (ports.some(port => !port.productId))
      {
        this.invalidPorts += 1;

        if (this.invalidPorts === 4)
        {
          return this.restartProcessor();
        }

        return this.configPorts();
      }

      this.invalidPorts = 0;

      this.handleData(ports.map(port => port.processInputs.split(' ').slice(5, 9).join('')));

      this.timers.read = setTimeout(this.read.bind(this), 10);
    }
    catch (err)
    {
      delete err.request;
      delete err.response;

      this.logger.error(err, 'Failed to read ports.');

      this.timers.read = setTimeout(this.read.bind(this), 10000);
    }
  }

  async configPorts()
  {
    const bytes = [
      '24', '00', '02', '0F', '00', '00', '0C', '11', '00',
      '00', '00', '00', '00', '00', '00', '00', '00', '00',
      '00', '00', '00', '00', '00', '00', '00', '00', '00',
      '00', '00', '00', '00', '00', '00', '00', '20', '20'
    ];

    try
    {
      for (const station of this.stations)
      {
        this.logger.debug('Configuring port...', {stationNo: station.no, portNo: station.port});

        bytes[4] = station.port.toString(16).toUpperCase().padStart(2, '0');

        const data = `UDP_Packet=${bytes.join('.')}`;

        const res = await axios({
          method: 'POST',
          url: `http://${this.options.processorIp}/TMG.htm`,
          headers: {
            'User-Agent': process.env.WMES_USER_AGENT || 'wmes-client',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
          },
          timeout: 2000,
          maxRedirects: 0,
          validateStatus: null,
          data
        });

        if (res.status !== 200)
        {
          throw Object.assign(new Error('Invalid response status.'), {
            expectedStatus: 200,
            actualStatus: res.status
          });
        }

        console.log(res.data);
      }
    }
    catch (err)
    {
      delete err.request;
      delete err.response;

      this.logger.error(err, 'Failed to configure port.');
    }

    this.timers.read = setTimeout(this.read.bind(this), 500);
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
      this.invalidPorts = 0;
    }

    this.timers.read = setTimeout(this.read.bind(this), 10000);
  }
}

module.exports = BalluffBniProcessor;
