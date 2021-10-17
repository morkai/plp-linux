'use strict';

const fs = require('fs');
const mongodb = require('./horti-mongodb');

exports.id = 'horti-frontend';

Object.assign(exports, require('./horti-common'));

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'events',
  'pubsub',
  'user',
  {id: 'h5-express', name: 'express'},
  {id: 'h5-remoteApi', name: 'remoteApi'},
  'users',
  'horti-tests',
  {id: 'messenger/client', name: 'messenger/client:controller'},
  // {id: 'messenger/client', name: 'messenger/client:wmes'},
  'controller',
  'messenger/server',
  'httpServer',
  'sio'
];

exports.updater = {
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 5000,
  pull: {
    exe: 'git.exe',
    cwd: `${__dirname}/../`,
    timeout: 30000
  },
  versionsKey: 'horti',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: '/manifest.appcache',
      mainJsFile: '/horti-main.js',
      mainCssFile: '/assets/horti-main.css',
      template: fs.readFileSync(`${__dirname}/horti-manifest.appcache`, 'utf8'),
      frontendAppData: {
        XLSX_EXPORT: process.platform === 'win32',
        CORS_PING_URL: 'https://test.wmes.pl/ping'
      },
      dictionaryModules: {}
    }
  ]
};

exports.events = {
  collection: app => app.mongoose.model('Event').collection,
  insertDelay: 1000,
  topics: {
    debug: [
      '*.added', '*.edited'
    ],
    warning: [
      '*.deleted'
    ],
    error: [
      '*.syncFailed',
      'app.started'
    ]
  },
  blacklist: [

  ]
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 1337
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    '*.added', '*.edited', '*.deleted', '*.synced'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 5
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.express = {
  staticPath: `${__dirname}/../frontend`,
  staticBuildPath: `${__dirname}/../frontend-build`,
  sessionCookieKey: 'horti.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 90 * 1000,
    sameSite: 'lax',
    secure: false
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: false
  },
  cookieSecret: '1ee7\\/\\/horti',
  ejsAmdHelpers: {
    _: 'underscore',
    $: 'jquery',
    t: 'app/i18n',
    time: 'app/time',
    user: 'app/user',
    forms: 'app/core/util/forms'
  },
  textBody: {limit: '1mb'},
  jsonBody: {limit: '1mb'},
  routes: [
    require('../backend/routes/core')
  ]
};

exports.remoteApi = {
  apiUrl: null,
  apiKey: null
};

exports.user = {
  userInfoIdProperty: 'id',
  localAddresses: [/^192\.168\./]
};

exports.users = {

};

exports['messenger/server'] = {
  pubHost: '0.0.0.0',
  pubPort: 5052,
  repHost: '0.0.0.0',
  repPort: 5053,
  broadcastTopics: []
};

exports['messenger/client:controller'] = {
  pubHost: '127.0.0.1',
  pubPort: 5050,
  repHost: '127.0.0.1',
  repPort: 5051,
  responseTimeout: 15000
};

exports['messenger/client:wmes'] = {
  pubHost: '127.0.0.1',
  pubPort: 28010,
  repHost: '127.0.0.1',
  repPort: 28011,
  responseTimeout: 15000,
  subscribeTopics: [
    'horti.tests.saved'
  ]
};

exports['horti-tests'] = {

};

exports.controller = {
  messengerClientId: 'messenger/client:controller',
  managePrivilege: 'HORTI:MANAGE'
};
