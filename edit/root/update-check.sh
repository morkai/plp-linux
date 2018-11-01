#!/bin/bash

rm -f /root/latest.7z /root/update-do.sh

wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://192.168.21.60/plp-up/latest.7z

if [ $? -ne 0 ]; then
  wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://161.87.64.46/plp-up/latest.7z

  if [ $? -ne 0 ]; then
    wget --connect-timeout=3 --read-timeout=3 -t 1 -O /root/latest.7z http://192.168.1.250/plp-up/latest.7z
  fi
fi

7zr x -y /root/latest.7z
chmod +x /root/*.sh
/root/update-do.sh
rm -f /root/latest.7z /root/update-do.sh
