#!/bin/bash

killall Xsession >/dev/null 2>&1

while ! lsof -iTCP:443 -sTCP:LISTEN >/dev/null; do
  echo No HTTPS server...
  sleep 0.25
done

DISPLAY=:0.0 startx /etc/X11/Xsession /root/kiosk.sh >>/root/log/kiosk.txt 2>&1
