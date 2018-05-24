#!/bin/bash

echo "`date -Is` kiosk.sh..."

xset -dpms
xset s off
openbox-session &

while true
do
  killall google-chrome chrome
  sleep 0.25
  node /root/exited-chrome-cleanly.js
  node /root/set-resolution.js
  sleep 0.25
  google-chrome --user-data-dir=/root/google-chrome \
    --kiosk \
    --no-sandbox \
    --no-first-run \
    --fast \
    --fast-start \
    --touch-events \
    --overscroll-history-navigation=0 \
    --ignore-certificate-errors \
    --disable-popup-blocking \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-tab-switcher \
    --disable-translate \
    --disable-background-timer-throttling \
    --enable-floating-virtual-keyboard \
    'http://localhost/'
  sleep 0.5
done
