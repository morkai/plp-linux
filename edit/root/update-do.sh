#!/bin/bash

chmod +x /root/*.sh
chmod +w /root/*.json

mv /root/unzip /usr/bin/unzip
chown root:root /usr/bin/unzip
chmod 0755 /usr/bin/unzip
chmod +x /root/ps-load/node

cp -R /root/etc/* /etc
rm -rf /root/etc

service ntp stop
ntpd -qg
service ntp start
