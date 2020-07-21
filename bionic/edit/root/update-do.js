'use strict';

const fs = require('fs');
const {execSync} = require('child_process');

if (fs.readFileSync('/etc/machine-id', 'utf8').trim() === '5e099d2cf2d69585bc6c70905ddea12e')
{
  execSync(`rm -rf /etc/machine-id /var/lib/dbus/machine-id > /dev/null`);
  execSync(`dbus-uuidgen --ensure=/etc/machine-id`);
  execSync(`dbus-uuidgen --ensure`);
}
