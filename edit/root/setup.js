'use strict';

const fs = require('fs');
const execSync = require('child_process').execSync;

let reboot = false;

if (fs.existsSync(`/root/grub`))
{
  execSync(`cp -Rpf /root/setup/* /; echo`);
  execSync(`rm -rf /root/setup; echo`);
  execSync(`mv -f /root/grub /etc/default/grub; echo`);
  execSync(`update-grub2; echo`);
  execSync(`service ntp stop; ntpd -qg; service ntp start; echo`);

  if (process.argv[2] !== 'first')
  {
    reboot = true;
  }
}

execSync(`sed -i 's/TimeoutStartSec=5min/TimeoutStartSec=10/' /etc/systemd/system/network-online.target.wants/networking.service`);
execSync(`sed -i 's/timeout 300/timeout 10/' /etc/dhcp/dhclient.conf`);
execSync(`systemctl disable apt-daily.service`);
execSync(`systemctl disable apt-daily.timer`);
execSync(`systemctl disable apt-daily-upgrade.service`);
execSync(`systemctl disable apt-daily-upgrade.timer`);
execSync(`apt remove --purge unattened-upgrades`);
execSync(`chmod +x /root/*.sh /root/xiconf/bin/fake-programmer.sh /root/ps-load/node`);
execSync(`chmod +w /root/*.json /root/ps-load/*.json`);
execSync(`chmod -R +w /root/xiconf/data /root/xiconf/logs`);

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
  const ifconfig = execSync('ifconfig -a');
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
const biosVendor = execSync('dmidecode -s bios-vendor').toString();
const systemSerialNumber = execSync('dmidecode -s system-serial-number').toString();
const systemProductName = execSync('dmidecode -s system-product-name').toString();
const vendor = biosVendor.toUpperCase().includes('DELL') ? 'DELL' : systemProductName.startsWith('UP') ? 'UP' : 'HP';
const suffix = !systemSerialNumber.includes('fill') ? systemSerialNumber : mac.toUpperCase().replace(/:/g, '').substring(6);
const hostname = `${vendor}-${suffix}`;

fs.writeFileSync('/etc/hostname', hostname);
fs.writeFileSync('/etc/hosts', fs.readFileSync('/etc/hosts', 'utf8').replace(/127.0.1.1\s+.*?\n/, `127.0.1.1\t${hostname}\n`));

if (networkInterfaces.wlan)
{
  if (networkInterfaces.lan)
  {
    execSync(`ifconfig ${networkInterfaces.lan.name} down`);
  }

  execSync(`ifconfig ${networkInterfaces.wlan.name} up`);
}
else if (networkInterfaces.lan)
{
  execSync(`ifconfig ${networkInterfaces.lan.name} up`);
}

if (reboot)
{
  execSync(`reboot`);
}
