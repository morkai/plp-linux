'use strict';

const {spawn} = require('child_process');

const ROOT = `${__dirname}/..`;
const ENV = {
  ...process.env,
  NODE_ENV: 'production',
  NODE_TLS_REJECT_UNAUTHORIZED: '0'
};

module.exports = {
  'ps-load': {
    main: {
      spawn: () => spawn(`${ROOT}/ps-load/node`, [`${ROOT}/ps-load/main.js`], {
        cwd: `${ROOT}/ps-load`,
        env: {...ENV}
      })
    }
  },
  xiconf: {
    frontend: {
      spawn: () => spawn(process.execPath, [
        `${ROOT}/xiconf/backend/main.js`,
        `${ROOT}/xiconf/config/up/xiconf-frontend.js`,
        '--require-cache',
        `${ROOT}/xiconf/backend-build/xiconf-frontend.json`
      ], {
        cwd: `${ROOT}/xiconf`,
        env: {...ENV}
      })
    }
  },
  snf: {
    $services: ['mongod'],
    frontend: {
      spawn: () => spawn(process.execPath, [
        `${ROOT}/snf/backend/main.js`,
        `${ROOT}/snf/config/up/snf-frontend.js`,
        '--require-cache',
        `${ROOT}/snf/backend-build/snf-frontend.json`
      ], {
        cwd: `${ROOT}/snf`,
        env: {...ENV}
      })
    },
    controller: {
      spawn: () => spawn(process.execPath, [
        `${ROOT}/snf/backend/main.js`,
        `${ROOT}/snf/config/up/snf-controller.js`,
        '--require-cache',
        `${ROOT}/snf/backend-build/snf-controller.json`
      ], {
        cwd: `${ROOT}/snf`,
        env: {...ENV}
      })
    }
  },
  'ct-camera': {
    main: {
      spawn: () => spawn(process.execPath, [`${ROOT}/ct/camera.js`], {
        cwd: `${ROOT}/ct`,
        env: {...ENV}
      })
    }
  },
  'ct-balluff': {
    main: {
      spawn: () => spawn(process.execPath, [`${ROOT}/ct/balluff.js`], {
        cwd: `${ROOT}/ct`,
        env: {...ENV}
      })
    }
  }
};
