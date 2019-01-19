#!/bin/bash

rm -rf /root/update /root/latest.7z /root/update-do.sh

wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://192.168.21.60/plp-up/latest.7z

if [ $? -ne 0 ]; then
  wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://161.87.64.46/plp-up/latest.7z

  if [ $? -ne 0 ]; then
    wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://192.168.1.250/plp-up/latest.7z
  fi
fi

7zr x -y -o/root/update /root/latest.7z

old_version=`cat /root/version.txt | tr -d [:space:]`
new_version=`cat /root/update/version.txt | tr -d [:space:]`

echo Current version: $old_version
echo New version: $new_version

if [[ $old_version < $new_version ]] ;
then
  cp -rf /root/update /root
  chmod +x /root/*.sh
  /root/update-do.sh
fi

rm -rf /root/update /root/latest.7z /root/update-do.sh
