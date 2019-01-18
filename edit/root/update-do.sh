#!/bin/bash

export no_proxy=192.168.21.60,161.87.64.46,192.168.1.250

http_proxy=http://192.168.21.60:8080/
wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - http://192.168.21.60/ping

if [ $? -ne 0 ]; then
  http_proxy=http://161.87.64.46:8080/
  wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - http://161.87.64.46/ping

  if [ $? -ne 0 ]; then
    http_proxy=http://192.168.1.250:8080/
    wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - http://192.168.1.250/ping
  fi
fi

https_proxy=$http_proxy

export http_proxy https_proxy

systemctl disable apt-daily.service
systemctl disable apt-daily.timer
systemctl disable apt-daily-upgrade.service
systemctl disable apt-daily-upgrade.timer
apt-get remove -y --purge unattended-upgrades

apt-get update
apt-get install -y curl unzip

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
    dpkg -i /root/google-chrome-stable_71.0.3578.98-1_amd64.deb
  fi
fi

rm -rf /root/google-chrome-stable_71.0.3578.98-1_amd64.deb
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
