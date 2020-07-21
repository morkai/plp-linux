'use strict';

const mongodb = require('./snf-mongodb');

exports.id = 'snf-controller';

Object.assign(exports, require('./snf-common'));

exports.modules = [
  'updater',
  {id: 'h5-mongoose', name: 'mongoose'},
  'events',
  'modbus',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:frontend'},
  'program'
];

exports.updater = {
  expressId: null,
  sioId: null,
  packageJsonPath: `${__dirname}/../package.json`,
  restartDelay: 2000,
  versionsKey: 'snf',
  backendVersionKey: 'controller',
  frontendVersionKey: null
};

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  userId: null,
  expressId: null,
  insertDelay: 1000,
  topics: {
    debug: [

    ],
    info: [
      'events.**'
    ],
    success: [

    ],
    error: [
      'app.started'
    ]
  },
  print: ['modbus.error']
};

exports['messenger/server'] = {
  pubHost: '0.0.0.0',
  pubPort: 5050,
  repHost: '0.0.0.0',
  repPort: 5051,
  broadcastTopics: ['events.saved', 'snf.tests.started', 'snf.tests.finished']
};

exports['messenger/client:frontend'] = {
  pubHost: '127.0.0.1',
  pubPort: 5052,
  repHost: '127.0.0.1',
  repPort: 5053,
  responseTimeout: 15000
};

exports.mongoose = {
  uri: mongodb.uri,
  mongoClient: Object.assign(mongodb.mongoClient, {
    poolSize: 5
  }),
  maxConnectTries: 10,
  connectAttemptDelay: 500
};

exports.program = {

};

exports.modbus = {
  dbId: 'mongoose',
  settingsCollection: function(app) { return app.mongoose.connection.db.collection('settings'); },
  writeAllTheThings: 'sim',
  maxReadQuantity: 25,
  ignoredErrors: [
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ResponseTimeout'
  ],
  broadcastFilter: ['health'],
  controlMasters: ['sim'],
  masters: {
    sim: {
      defaultTimeout: 100,
      interval: 100,
      suppressTransactionErrors: true,
      transport: {
        type: 'ip'
      },
      connection: {
        type: 'tcp',
        socketOptions: {
          host: '127.0.0.2',
          port: 502
        },
        noActivityTime: 2000
      }
    }
  },
  tagsFile: __dirname + '/tags.csv',
  tags: {}
};
