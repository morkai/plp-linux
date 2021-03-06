'use strict';

const path = require('path');

const ROOT_PATH = path.join(__dirname, '..', '..');
const DATA_PATH = path.join(ROOT_PATH, 'data');
const LOGS_PATH = path.join(ROOT_PATH, 'logs');
const BIN_PATH = path.join(ROOT_PATH, 'bin');

const config = module.exports = require('../xiconf-frontend');

Object.assign(config, {
  localSecretKey: null
});

Object.assign(config.httpServer, {
  port: /^[0-9]+$/.test(process.env.XICONF_PORT) ? +process.env.XICONF_PORT : 1337
});

Object.assign(config['h5-sqlite3'], {
  dbFile: path.join(DATA_PATH, 'db.sqlite3')
});

Object.assign(config.programmer, {
  httpPort: config.httpServer.port,
  featureDbPath: path.join(DATA_PATH, 'features'),
  gprsOutputFile: path.join(DATA_PATH, 'gprs-output.xml'),
  workflowFile: path.join(DATA_PATH, 'workflow.txt'),
  lastModeFile: path.join(DATA_PATH, 'lastMode.txt'),
  motoBarScanFile: path.join(BIN_PATH, 'corescanner-console-app')
});

Object.assign(config.history, {
  featureDbPath: config.programmer.featureDbPath,
  lastExportTimeFile: path.join(DATA_PATH, 'lastExportAt.txt')
});

Object.assign(config.updater, {
  unzipExe: '/usr/bin/unzip'
});

Object.assign(config.settings, {
  settingsFile: path.join(DATA_PATH, 'settings.json'),
  logsGlob: path.join(LOGS_PATH, '*.log'),
  remoteServers: [
    'https://ket.wmes.pl/'
  ]
});

Object.assign(config.settings.defaults, {
  password: '1@3',
  orders: 'required',
  remoteServer: 'https://ket.wmes.pl/',
  syncInterval: 1,
  featurePath1: '/dev/null',
  featurePath2: '',
  cancelDelay: 2000,
  programmerFile: path.join(ROOT_PATH, 'bin', 'fake-programmer.sh'),
  serviceTagPrint: 0,
  gprsProgrammerFile: path.join(ROOT_PATH, 'bin', 'fake-programmer.sh'),
  programming: 0,
  ledsEnabled: 1,
  ledsCheckingMode: 'remote'
});

Object.assign(config.settings.defaults.hotkeys, {
  continue: 'P',
  cancel: null
});
