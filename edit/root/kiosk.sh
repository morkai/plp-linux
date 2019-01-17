#!/bin/bash

echo "`date -Is` kiosk.sh..."

kiosk=--kiosk
locale=pl_PL.utf8

if [[ `hostname` == VM-* ]] ;
then
  kiosk=
fi

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
