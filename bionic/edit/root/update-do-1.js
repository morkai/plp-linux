'use strict';

const fs = require('fs');
const {execSync} = require('child_process');
const serverConfig = require('./server/config.json');

if (!fs.existsSync('/usr/bin/cscore'))
{
  console.log('Installing zebra-scanner-corescanner...');

  const deb = 'zebra-scanner-corescanner_4.4.1-11_amd64.deb';

  console.log('Trying dyn.wmes.pl...');

  try
  {
    execSync(`wget --no-check-certificate https://dyn.wmes.pl/files/clients/${deb}`);
  }
  catch (err)
  {
    console.log(`wget failure: ${err.message}`);
  }

  if (fs.existsSync(`/root/${deb}`))
  {
    console.log(`Installing ${deb}...`);

    execSync('apt-get install -y pkg-config libudev-dev');
    execSync(`dpkg -i /root/${deb}`);
    execSync(`rm -f /root/${deb}`);
    execSync('systemctl stop cscored');
    execSync('systemctl disable cscored');
  }
  else
  {
    console.log(`Missing ${deb}!`)
  }
}
else if (!serverConfig.apps.includes('xiconf'))
{
  execSync('systemctl stop cscored');
  execSync('systemctl disable cscored');
}

if (false && execSync('uname -r').toString().trim().startsWith('4'))
{
  console.log('Updating kernel...');

  try
  {
    const systemProductName = execSync('dmidecode -s system-product-name').toString().trim();

    if (systemProductName.startsWith('UP-'))
    {
      execSync('mv /usr/bin/linux-check-removal /usr/bin/linux-check-removal.orig');
      fs.writeFileSync('/usr/bin/linux-check-removal', '#!/bin/sh\nexit 0');
      execSync('chmod +x /usr/bin/linux-check-removal');
      execSync(`apt-get autoremove --purge 'linux-.*generic'`);
      execSync('apt-get install linux-generic-hwe-18.04-5.4-upboard -y');
      execSync('mv /usr/bin/linux-check-removal.orig /usr/bin/linux-check-removal');
      execSync('update-grub2');
    }
    else
    {
      const ubuntuVersion = execSync('lsb_release -r').toString().includes('20.04') ? '20.04' : '18.04';

      execSync(`apt-get install linux-generic-hwe-${ubuntuVersion} -y`);
    }
  }
  catch (err)
  {
    console.log(`kernel update failure: ${err.message}`);
  }
}

try
{
  let blacklist = fs.readFileSync('/etc/modprobe.d/blacklist.conf', 'utf8');

  if (!blacklist.includes('blacklist dw_dmac'))
  {
    console.log('Updating modprobe blacklist...');

    blacklist += `
blacklist dw_dmac
blacklist dw_dmac_core
install dw_dmac /bin/true
install dw_dmac_core /bin/true`;

    fs.writeFileSync('/etc/modprobe.d/blacklist.conf', blacklist);

    execSync('update-initramfs -u');
  }
}
catch (err)
{
  console.log(`modprobe blacklist failure: ${err.message}`);
}
