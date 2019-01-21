#!/bin/bash

export no_proxy=192.168.21.60,161.87.64.46,192.168.1.250

base_url=http://192.168.21.60
http_proxy=$base_url:8080/
wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - $base_url/ping

if [ $? -ne 0 ]; then
  base_url=http://161.87.64.46
  http_proxy=$base_url:8080/
  wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - $base_url/ping

  if [ $? -ne 0 ]; then
    base_url=http://192.168.1.250
    http_proxy=$base_url:8080/
    wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - $base_url/ping
  fi
fi

https_proxy=$http_proxy

export http_proxy https_proxy

systemctl disable apt-daily.service
systemctl disable apt-daily.timer
systemctl disable apt-daily-upgrade.service
systemctl disable apt-daily-upgrade.timer
apt-get remove -y --purge unattended-upgrades

apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 1655A0AB68576280

apt-get update
apt-get install -y curl unzip

if [ ! -f /usr/bin/x11vnc ] ;
then
  apt-get install -y x11vnc
  mkdir /root/.vnc/
  x11vnc -storepasswd x11vncplx /root/.vnc/passwd
fi

DEBIAN_FRONTEND=noninteractive apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" upgrade

if ! [[ `node -v` == v10* ]] ;
then
  wget -q --connect-timeout=10 --read-timeout=10 -t 3 -O - https://deb.nodesource.com/setup_10.x | bash -
  apt-get install -y nodejs
fi

apt-get autoremove -y

if [[ `google-chrome-stable --version` =~ ([0-9]+)\. ]] ;
then
  if (( ${BASH_REMATCH[1]} < 71 )) ;
  then
    wget $base_url/plp-up/google-chrome-stable.deb
    dpkg -i /root/google-chrome-stable.deb
    rm -rf /root/google-chrome-stable.deb
  fi
fi

rm /etc/opt/chrome/policies/managed/plp.json

cp -Rf /root/etc/* /etc
rm -rf /root/etc

chmod +x /root/*.sh
chmod +w /root/*.json

node /root/update-do.js
rm /root/update-do.js

service ntp stop
ntpd -qg
service ntp start

killall xinit
sleep 1
rm -rf /root/google-chrome
mkdir /root/google-chrome
echo -e '#!/bin/bash\nsleep 3\nreboot\n' > /tmp/reboot3s.sh
chmod +x /tmp/reboot3s.sh
nohup /tmp/reboot3s.sh > /dev/null 2>&1 &
