'use strict';

const fs = require('fs');
const {execSync} = require('child_process');
const config = require('./server/config.json');

console.log('Removing old logs...');

fs.readdirSync('/root/log').forEach(d =>
{
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}_/.test(d))
  {
    const parts = d.split('_');
    const time = Date.parse(`${parts[0]}T${parts[1].replace(/-/g, ':')}`);

    if (Date.now() - time > 7 * 24 * 3600 * 1000)
    {
      tryExec(`rm -rf /root/log/${d}`, 10);
    }
  }
});

if (!tryExec(`certutil -d sql:/root/.pki/nssdb -L`).includes('local.wmes.pl'))
{
  console.log('Installing the certificate authority...');

  tryExec(`certutil -d sql:/root/.pki/nssdb -A -t "TCP,TCP,TCP" -n local.wmes.pl -i /root/server/ssl/local.wmes.pl.ca.crt`);
}

let reboot = false;

if (fs.existsSync(`/root/setup`))
{
  console.log('Setting up after install...');

  tryExec(`cp -Rpf /root/setup/* /; echo`);
  tryExec(`rm -rf /root/setup; echo`);
  tryExec(`apt-get remove -y --purge unattended-upgrades landscape-common; echo`);
  tryExec(`apt-get autoremove -y; echo`);
  tryExec(`update-grub2; echo`);
  tryExec(`netplan apply; echo`);
  tryExec(`systemctl disable motd-news.service`);
  tryExec(`systemctl disable motd-news.timer`);
  tryExec(`sysctl -w kernel.unprivileged_userns_clone=1`);

  reboot = true;
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

    tryExec('update-initramfs -u');
  }
}
catch (err)
{
  console.log(`modprobe blacklist failure: ${err.message}`);
}

console.log('Setting up the network...');

const networkInterfaces = {};
const oldNetplan = fs.readFileSync('/etc/netplan/01-netcfg.yaml', 'utf8');
let newNetplan = `network:
  version: 2
  renderer: networkd`;
let lastNetworkInterface = null;

tryExec(`ifconfig -a`).split('\n').forEach(line =>
{
  let matches = line.match(/^([a-z0-9]+):/i);

  if (matches)
  {
    if (matches[1] === 'lo')
    {
      return;
    }

    lastNetworkInterface = matches[1];

    networkInterfaces[lastNetworkInterface] = {
      ip: '',
      mac: ''
    };

    return;
  }

  if (!lastNetworkInterface)
  {
    return;
  }

  matches = line.match(/inet\s+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)\s+/i);

  if (matches)
  {
    networkInterfaces[lastNetworkInterface].ip = matches[1];
  }

  matches = line.match(/\s+((?::?[a-f0-9]{2}){6})\s+/i);

  if (matches)
  {
    networkInterfaces[lastNetworkInterface].mac = matches[1].toUpperCase();
  }
});

if (networkInterfaces.eth0 || networkInterfaces.eth1)
{
  newNetplan += `
  ethernets:`;

  if (config.staticIp)
  {
    if (networkInterfaces.eth0 && networkInterfaces.eth1)
    {
      newNetplan += `
    eth0:
      dhcp4: true
      optional: true
    eth1:
      addresses: [${config.staticIp}]`;
    }
    else if (networkInterfaces.eth0)
    {
      newNetplan += `
    eth0:
      addresses: [${config.staticIp}]`;
    }
  }
  else if (networkInterfaces.eth0)
  {
    newNetplan += `
    eth0:
      dhcp4: true
      optional: true`;
  }
}

if (networkInterfaces.wlan0)
{
  newNetplan += `
  wifis:
    wlan0:
      dhcp4: true
      optional: true
      access-points:
        "ML_WLAN":
          password: "AN/APQ-99"
        "007-2G":
          password: "internet daj"`;
}

newNetplan += '\n';

if (newNetplan.trim() !== oldNetplan.trim())
{
  fs.writeFileSync('/etc/netplan/01-netcfg.yaml', newNetplan);
  tryExec('netplan apply');

  reboot = true;
}

console.log('Setting hostname...');

const mac = networkInterfaces.eth0 ? networkInterfaces.eth0.mac : '00:00:00:00:00:00';
const oldHostname = fs.readFileSync('/etc/hostname', 'utf8').trim();
const newHostname = `wmes-` + mac.toLowerCase().replace(/:/g, '').substring(6);
const etcHosts = fs.readFileSync('/etc/hosts', 'utf8').trim().split('\n').map(line =>
{
  if (line.startsWith('#'))
  {
    return line;
  }

  const hosts = line.trim().split(/\s+/);
  const addr = hosts.shift();

  if (addr === '127.0.0.1')
  {
    if (!hosts.includes('local.wmes.pl'))
    {
      hosts.push('local.wmes.pl');
    }
  }
  else if (addr === '127.0.1.1')
  {
    while (hosts.length)
    {
      hosts.pop();
    }

    hosts.push(newHostname);
  }

  return `${addr} ${hosts.join(' ')}`;
});

fs.writeFileSync('/etc/hosts', etcHosts.join('\n') + '\n');
fs.writeFileSync('/etc/hostname', newHostname);

reboot = reboot || newHostname !== oldHostname;

if (reboot)
{
  console.log('Rebooting...');

  tryExec(`reboot`);
}

function tryExec(cmd, timeout)
{
  try
  {
    return String(execSync(cmd, {timeout: (timeout || 120) * 1000}));
  }
  catch (err)
  {
    console.error(`Command failed:`);
    console.error(cmd);
    console.error(err.message);
  }

  return '';
}
