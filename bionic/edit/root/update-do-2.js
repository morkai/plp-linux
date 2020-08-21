'use strict';

const fs = require('fs');
const {hostname, networkInterfaces} = require('os');

if (fs.existsSync('/opt/cybereason/sensor/etc/sensor.conf'))
{
  const config = fs.readFileSync('/opt/cybereason/sensor/etc/sensor.conf', 'utf8').split('\n').map(line =>
  {
    const parts = line.trim().split('=');
    const key = parts.shift();

    if (key.length === 0)
    {
      return '';
    }

    let value = parts.join('=');

    if (key === 'server.signonProxyList')
    {
      value = 'zscaler.proxy.intra.lighting.com:9480,fwproddmz.dmz.intra.lighting.com:3128,dyn.wmes.pl:8080';
    }
    else if (key === 'server.signonProxyType')
    {
      value = 'http,http,http';
    }
    else if (key === 'server.channelName' && !value.toLowerCase().includes(hostname().toLowerCase()))
    {
      const ifaces = networkInterfaces();
      const iface = (ifaces.eth0 && ifaces.eth0[0])
        || (ifaces.wlan0 && ifaces.wlan0[0])
        || (ifaces.lo && ifaces.lo[0]);

      if (iface && iface.mac)
      {
        const host = hostname().toUpperCase();
        const mac = iface.mac.replace(/:/g, '').toUpperCase();

        value = `PY10:PYLUMCLIENT_BRIGHTLIGHT_${host}_${mac}`;
      }
      else if (key === 'lastActiveInitTime')
      {
        value = Math.round(Date.now() / 1000).toString();
      }
    }

    return `${key}=${value}`;
  });

  fs.writeFileSync('/opt/cybereason/sensor/etc/sensor.conf', config.filter(l => !!l.length).join('\n'));
}
