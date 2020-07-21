'use strict';

const fs = require('fs');
const mongodb = require('./snf-mongodb');

exports.id = 'snf-frontend';

Object.assign(exports, require('./snf-common'));

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'events',
  'pubsub',
  'user',
  {id: 'h5-express', name: 'express'},
  {id: 'h5-remoteApi', name: 'remoteApi'},
  'users',
  'snf-programs',
  'snf-tests',
  {id: 'messenger/client', name: 'messenger/client:controller'},
  {id: 'messenger/client', name: 'messenger/client:wmes'},
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
  versionsKey: 'snf',
  manifests: [
    {
      frontendVersionKey: 'frontend',
      path: '/manifest.appcache',
      mainJsFile: '/snf-main.js',
      mainCssFile: '/assets/snf-main.css',
      template: fs.readFileSync(`${__dirname}/snf-manifest.appcache`, 'utf8'),
      frontendAppData: {
        XLSX_EXPORT: process.platform === 'win32',
        CORS_PING_URL: 'https://test.wmes.pl/ping'
      },
      dictionaryModules: {}
    }
  ]
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'users.login', 'users.logout',
      '*.added', '*.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted'
    ],
    error: [
      'app.started'
    ]
  },
  blacklist: []
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
  sessionCookieKey: 'snf.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 10 * 60 * 1000,
    touchChance: 0,
    gcInterval: 8 * 3600,
    cacheInMemory: false
  },
  cookieSecret: '1ee7\\/\\/snf',
  ejsAmdHelpers: {
    _: 'underscore',
    $: 'jquery',
    t: 'app/i18n',
    time: 'app/time',
    user: 'app/user',
    forms: 'app/core/util/forms'
  },
  textBody: {limit: '15mb'},
  jsonBody: {limit: '4mb'},
  routes: () =>
  {
    return [
      require('../backend/routes/core')
    ];
  }
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
  broadcastTopics: ['snf.programs.edited', 'snf.programs.deleted']
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
    'snf.programs.edited',
    'snf.programs.deleted',
    'snf.tests.saved'
  ]
};

exports['snf-programs'] = {
  imagesPath: `${__dirname}/../data/uploads/programs`
};

exports['snf-tests'] = {
  controllerClientId: 'messenger/client:controller',
  remoteClientId: 'messenger/client:wmes',
};

exports.controller = {
  messengerClientId: 'messenger/client:controller'
};
