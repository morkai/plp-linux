#!/bin/bash

base_url=http://dyn.wmes.pl

echo Checking proxy...
res=$(wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - https://test.wmes.pl/ping)

if [ "$res" == "pong" ]
then
  echo Not using a proxy: there is access to the Internet!
else
  export no_proxy=$base_url
  export http_proxy=$base_url:8080/
  export https_proxy=$base_url:8080/

  res=$(wget -q --no-proxy --connect-timeout=3 --read-timeout=3 -t 1 -O - $base_url/ping)

  if [ "$res" == "pong" ]
  then
    echo Proxy available!
  else
    echo Proxy not available!
    exit 1
  fi
fi

echo APT update...
apt-get update

echo APT upgrade...
DEBIAN_FRONTEND=noninteractive apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" upgrade

echo APT cleanup...
apt-get autoremove -y

echo update-do.js...
node /root/update-do.js
rm /root/update-do.js

if [ -d "/root/node_modules_new" ]; then
  echo Updating node_modules...
  rm -rf /root/node_modules_old
  mv /root/node_modules /root/node_modules_old
  mv /root/node_modules_new /root/node_modules
fi

if [ -d "/root/update" ]; then
  cp -rf /root/update/* /
  rm -rf /root/update
fi

chmod +x /root/set-permissions.sh
/root/set-permissions.sh

echo Reboot...
killall xinit
sleep 1
echo -e '#!/bin/bash\nsleep 3\nreboot\n' > /tmp/reboot3s.sh
chmod +x /tmp/reboot3s.sh
nohup /tmp/reboot3s.sh > /dev/null 2>&1 &
