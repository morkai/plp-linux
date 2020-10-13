'use strict';

const fs = require('fs');
const {execSync} = require('child_process');

if (fs.existsSync('/root/zebra-scanner-corescanner_4.4.1-11_amd64.deb'))
{
  console.log('Installing zebra-scanner-corescanner_4.4.1-11_amd64.deb...');

  execSync('apt-get install pkg-config libudev-dev');
  execSync('dpkg -i /root/zebra-scanner-corescanner_4.4.1-11_amd64.deb');
  execSync('rm -f /root/zebra-scanner-corescanner_4.4.1-11_amd64.deb');
}
