#!/bin/bash

echo "`date -Is` kiosk.sh..."

locale=pl_PL.utf8

xset -dpms
xset s off
openbox-session &
x11vnc -no6 -noipv6 -nevershared -forever -usepw -xkb -noxrecord -noxfixes -noxdamage -logfile /var/log/x11vnc.log -display :0 &

while true
do
  killall google-chrome chrome
  sleep 0.25
  node /root/exited-chrome-cleanly.js
  node /root/set-resolution.js
  sleep 0.25
  kiosk=--kiosk
  if [[ `hostname` == VM-* ]] || [[ -f /tmp/no-kiosk ]] ;
  then
    kiosk=
  fi
  rm /tmp/no-kiosk
  LANG=$locale LANGUAGE=$locale google-chrome --user-data-dir=/root/google-chrome \
    $kiosk \
    --allow-insecure-localhost \
    --allow-running-insecure-content \
    --disable-background-timer-throttling \
    --disable-client-side-phishing-detection \
    --disable-contextual-search \
    --disable-infobars \
    --disable-password-generation \
    --disable-physical-keyboard-autocorrect \
    --disable-popup-blocking \
    --disable-print-preview \
    --disable-pull-to-refresh-effect \
    --disable-signin-promo \
    --disable-single-click-autofill \
    --disable-sync \
    --disable-virtual-keyboard-overscroll \
    --enable-web-notification-custom-layouts \
    --ignore-certificate-errors \
    --no-default-browser-check \
    --no-first-run \
    --no-pings \
    --no-sandbox \
    --noerrdialogs \
    --overscroll-history-navigation=0 \
    --touch-events \
    'http://localhost/'
  sleep 1
done
