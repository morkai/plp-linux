'use strict';

module.exports = {
  uri: process.env.HORTI_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-horti',
  keepAliveQueryInterval: 15000,
  mongoClient: {
    minPoolSize: 1,
    maxPoolSize: 15,
    noDelay: true,
    keepAlive: true,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 0,
    forceServerObjectId: false,
    writeConcern: {
      w: 1,
      wtimeoutMS: 15000
    },
    autoIndex: true,
    enableUtf8Validation: false
  }
};

if (process.env.HORTI_MONGODB_REPLICA_SET)
{
  module.exports.mongoClient.replicaSet = process.env.HORTI_MONGODB_REPLICA_SET;
}
