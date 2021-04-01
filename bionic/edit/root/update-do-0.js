'use strict';

const fs = require('fs');
const {execSync} = require('child_process');

if (fs.readFileSync('/etc/machine-id', 'utf8').trim() === '5e099d2cf2d69585bc6c70905ddea12e')
{
  console.log('Regenerating machine ID...');

  execSync(`rm -rf /etc/machine-id /var/lib/dbus/machine-id > /dev/null`);
  execSync(`dbus-uuidgen --ensure=/etc/machine-id`);
  execSync(`dbus-uuidgen --ensure`);
}

if (!execSync('google-chrome-stable --version').toString().includes('84.0.4147.135'))
{
  console.log('Reinstalling google-chrome-stable...');

  const deb = 'google-chrome-stable_84.0.4147.135-1_amd64.deb';

  console.log('Trying dyn.wmes.pl...');
  tryExecSync(`wget --no-check-certificate https://dyn.wmes.pl/files/clients/${deb}`);

  if (!fs.existsSync(`/root/${deb}`))
  {
    console.log('Trying dl.google.com...');
    tryExecSync(`wget http://dl.google.com/linux/chrome/deb/pool/main/g/google-chrome-stable/${deb}`);
  }

  if (fs.existsSync(`/root/${deb}`))
  {
    console.log(`Installing ${deb}...`);

    execSync(`dpkg -r google-chrome-stable`);
    execSync(`apt-get install libappindicator3-1`);
    execSync(`dpkg -i ${deb}`);
    execSync(`rm /root/${deb}`);
    execSync(`apt-mark hold google-chrome-stable`);
  }
  else
  {
    console.log(`Missing ${deb}!`)
  }
}
else
{
  console.log('Holding google-chrome-stable...');

  execSync(`apt-mark hold google-chrome-stable`);
}

function tryExecSync(cmd)
{
  try
  {
    execSync(cmd);
  }
  catch (err)
  {
    console.error(err.stack);
  }
}
