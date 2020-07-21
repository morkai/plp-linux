#!/bin/bash

export WMES_API_KEY=`cat /root/apikey.txt | tr -d '[:space:]'`
export WMES_VERSION=`cat /root/version.txt | tr -d '[:space:]'`
export WMES_USER_AGENT=wmes-client/$WMES_VERSION

if [ "`tty`" = "/dev/tty1" ]
then
  rm -rf /root/Desktop/ /root/Documents/ /root/Downloads/ /root/Music/ /root/Pictures/ /root/Public/ /root/Templates/ /root/Videos/ /root/*_scrot.png

  chmod +x /root/set-permissions.sh
  /root/set-permissions.sh

  LOG_DATE=$(date +%F_%H-%M-%S)
  mkdir -p /root/log/$LOG_DATE
  mv /root/log/*.txt /root/log/$LOG_DATE

  node /root/setup.js >>/root/log/setup.txt 2>&1

  /root/start-server.sh
  /root/start-kiosk.sh
fi
