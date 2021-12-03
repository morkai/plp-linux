'use strict';

const config = module.exports = require('../snf-controller');

config.modbus.writeAllTheThings = null;

config.modbus.controlMasters = ['snfPlc'];

config.modbus.masters = {
  snfPlc: {
    defaultTimeout: 100,
    interval: 100,
    suppressTransactionErrors: true,
    transport: {
      type: 'ip'
    },
    connection: {
      type: 'tcp',
      socketOptions: {
        host: '192.168.1.5',
        port: 502
      },
      noActivityTime: 2000
    }
  }
};
