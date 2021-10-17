'use strict';

const fs = require('fs');

const config = module.exports = require('../horti-controller');

config.modbus.writeAllTheThings = null;

config.modbus.controlMasters = ['moxa'];

let master = process.env.HORTI_MASTER_ADDRESS;

if (!master && fs.existsSync(`${__dirname}/master.txt`))
{
  master = fs.readFileSync(`${__dirname}/master.txt`, 'utf8').trim();
}

config.modbus.masters = {
  moxa: {
    connection: {
      type: 'tcp',
      socketOptions: {
        host: master || '192.168.1.5',
        port: 502
      },
      autoOpen: true,
      autoReconnect: true,
      minConnectTime: 2500,
      maxReconnectTime: 5000,
      noActivityTime: 30000,
      closeOnDestroy: true,
      suppressErrorsAfterDestroy: true
    },
    transport: {
      type: process.env.NODE_ENV === 'development' ? 'ip' : 'rtu',
      eofTimeout: 100
    },
    suppressTransactionErrors: true,
    retryOnException: false,
    maxConcurrentTransactions: 1,
    defaultUnit: 0,
    defaultMaxRetries: 0,
    defaultTimeout: 400,
    interval: 100
  }
};

config['messenger/server'] = {
  ...config['messenger/server'],
  pubPort: 5060,
  repPort: 5061
};

config['messenger/client:frontend'] = {
  ...config['messenger/client:frontend'],
  pubPort: 5062,
  repPort: 5063
};
