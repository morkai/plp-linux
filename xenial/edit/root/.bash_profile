#!/bin/bash

if [ "`tty`" = "/dev/tty1" ]
then
  echo "`date -Is` .bash_profile..." > /root/log
  /root/setup.sh >> /root/log 2>&1
  node /root/server.js >> /root/log 2>&1 &
  sleep 0.333
  startx /etc/X11/Xsession /root/kiosk.sh >> /root/log 2>&1
fi
