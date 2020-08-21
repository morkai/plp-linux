'use strict';

const fs = require('fs');
const {execSync} = require('child_process');

if (fs.readFileSync('/etc/machine-id', 'utf8').trim() === '5e099d2cf2d69585bc6c70905ddea12e')
{
  execSync(`rm -rf /etc/machine-id /var/lib/dbus/machine-id > /dev/null`);
  execSync(`dbus-uuidgen --ensure=/etc/machine-id`);
  execSync(`dbus-uuidgen --ensure`);
}

if (fs.existsSync('/root/cybereason-sensor-LATEST.deb'))
{
  execSync('DEBIAN_FRONTEND=noninteractive apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" install gdb libelf1');
  execSync('dpkg -i /root/cybereason-sensor-LATEST.deb');
  execSync('rm -f /root/cybereason-sensor-LATEST.deb');
}
