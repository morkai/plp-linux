'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;

let reboot = false;

if (fs.existsSync(`/root/grub`))
{
  tryExec(`cp -Rpf /root/setup/* /; echo`);
  tryExec(`rm -rf /root/setup; echo`);
  tryExec(`mv -f /root/grub /etc/default/grub; echo`);
  tryExec(`update-grub2; echo`);
  tryExec(`service ntp stop; ntpd -qg; service ntp start; echo`);

  if (process.argv[2] !== 'first')
  {
    reboot = true;
  }
}

tryExec(`sed -i 's/TimeoutStartSec=5min/TimeoutStartSec=10/' /etc/systemd/system/network-online.target.wants/networking.service`);
tryExec(`sed -i 's/timeout 300/timeout 10/' /etc/dhcp/dhclient.conf`);
tryExec(`systemctl disable apt-daily.service`);
tryExec(`systemctl disable apt-daily.timer`);
tryExec(`systemctl disable apt-daily-upgrade.service`);
tryExec(`systemctl disable apt-daily-upgrade.timer`);
tryExec(`apt-get remove -y --purge unattended-upgrades`);
tryExec(`chmod +x /root/*.sh /root/xiconf/bin/fake-programmer.sh /root/ps-load/node`);
tryExec(`chmod +w /root/*.json /root/ps-load/*.json`);
tryExec(`chmod -R +w /root/xiconf/data /root/xiconf/logs`);

const networkInterfaces = {
  lo: {
    name: 'lo',
    mac: '00:00:00:00:00:00'
  },
  lan: null,
  wlan: null
};

(function()
{
  const ifconfig = tryExec('ifconfig -a');
  const re = /(eth[0-9]+|enp[0-9]+s[0-9]+|wlan[0-9]+|wlx[a-f0-9]+).*?HWaddr (.*?)\n/g;
  let matches;

  while ((matches = re.exec(ifconfig)) !== null)
  {
    const name = matches[1];
    const mac = matches[2].trim().toUpperCase();

    networkInterfaces[/^eth|enp/.test(name) ? 'lan' : 'wlan'] = {
      name: name,
      mac: mac
    };
  }
})();

let etcNetworkInterfaces = `
auto lo
iface lo inet loopback
`;

if (networkInterfaces.lan && !networkInterfaces.wlan)
{
  etcNetworkInterfaces += `
auto ${networkInterfaces.lan.name}
iface ${networkInterfaces.lan.name} inet dhcp
`;
}

if (networkInterfaces.wlan)
{
  etcNetworkInterfaces += `
auto ${networkInterfaces.wlan.name}
iface ${networkInterfaces.wlan.name} inet dhcp
wpa-driver wext
wpa-conf /etc/wpa_supplicant.conf
`;
}

fs.writeFileSync('/etc/network/interfaces', etcNetworkInterfaces);

const mac = (networkInterfaces.lan || networkInterfaces.wlan || networkInterfaces.lo).mac;
const biosVendor = tryExec('dmidecode -s bios-vendor').toString();
const systemSerialNumber = tryExec('dmidecode -s system-serial-number').toString();
const systemProductName = tryExec('dmidecode -s system-product-name').toString();
const vendor = biosVendor.toUpperCase().includes('DELL') ? 'DELL' : systemProductName.startsWith('UP') ? 'UP' : 'HP';
const suffix = /fill|default/i.test(systemSerialNumber)
  ? mac.toUpperCase().replace(/:/g, '').substring(6)
  : systemSerialNumber;
const hostname = `${vendor}-${suffix}`;

fs.writeFileSync('/etc/hostname', hostname);
fs.writeFileSync('/etc/hosts', fs.readFileSync('/etc/hosts', 'utf8').replace(/127.0.1.1\s+.*?\n/, `127.0.1.1\t${hostname}\n`));

if (networkInterfaces.wlan)
{
  if (networkInterfaces.lan)
  {
    tryExec(`ifconfig ${networkInterfaces.lan.name} down`);
  }

  tryExec(`ifconfig ${networkInterfaces.wlan.name} up`);
}
else if (networkInterfaces.lan)
{
  tryExec(`ifconfig ${networkInterfaces.lan.name} up`);
}

if (reboot)
{
  tryExec(`reboot`);
}

function tryExec(cmd)
{
  try
  {
    return execSync(cmd);
  }
  catch (err)
  {
    console.error(err.message);
  }
}
