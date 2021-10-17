'use strict';

const fs = require('fs');

const config = module.exports = require('../horti-frontend');

let domain = 'ket.wmes.pl';

try { domain = JSON.parse(fs.readFileSync('/root/server/config.json', 'utf8')).domain; }
catch (err) {}

config.httpServer.port = 1339;

config.user.localAddresses = ['127.0.0'];

config.remoteApi = {
  ...config.remoteApi,
  apiUrl: `https://${domain}/`,
  apiKey: '431ce304f1e448c5a6240992eea7c4a09a7f1bffd2584236bb60eef7c7d16d25'
};

config['messenger/client:wmes'] = {
  ...config['messenger/client:wmes'],
  pubHost: domain,
  repHost: domain
};

config['messenger/server'] = {
  ...config['messenger/server'],
  pubPort: 5062,
  repPort: 5063
};

config['messenger/client:controller'] = {
  ...config['messenger/client:controller'],
  pubPort: 5060,
  repPort: 5061
};
