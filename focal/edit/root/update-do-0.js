'use strict';

const fs = require('fs');

const node16 = fs.readFileSync('/etc/apt/sources.list.d/nodesource.list', 'utf8');
const node20 = node16.replaceAll('node_16.x', 'node_20.x');
fs.writeFileSync('/etc/apt/sources.list.d/nodesource.list', node20, 'utf8');
