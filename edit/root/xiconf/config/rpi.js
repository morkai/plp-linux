/*jshint maxlen:false*/

'use strict';

const config = module.exports = require('./frontend');

const moduleBlacklist = {
  'xiconfPrograms': true,
  'featureSync': true,
  'imWorking': true
};

config.modules = config.modules.filter(m => !moduleBlacklist[m]);

config.localSecretKey = 'rpi';

config.settings.logsGlob = '/var/log/xiconf*.log';
config.settings.defaults.password = '1@3';
config.settings.remoteServers = [
  'http://192.168.21.60/',
  'http://161.87.64.46/'
];

config.updater.unzipExe = '/usr/bin/unzip';
