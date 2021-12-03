'use strict';

const config = module.exports = require('../snf-frontend');

config.httpServer.port = 1338;

config.user.localAddresses = ['127.0.0', '192.168'];

Object.assign(config.remoteApi, {
  apiUrl: 'https://ket.wmes.pl/',
  apiKey: '28c66f16844af30f38cc1239c06c35832f03bfd5b3dfe7e573056a0cbd3912c5'
});

Object.assign(config['messenger/client:wmes'], {
  pubHost: 'ket.wmes.pl',
  repHost: 'ket.wmes.pl',
});
