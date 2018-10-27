#!/bin/bash

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y -o DPkg::options::="--force-confdef" -o DPkg::options::="--force-confold" upgrade

dpkg -i /root/google-chrome-stable_70.0.3538.77-1_amd64.deb
rm -rf /root/google-chrome-stable_70.0.3538.77-1_amd64.deb

chmod +x /root/*.sh
chmod +w /root/*.json
