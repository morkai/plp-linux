#!/bin/bash

DISPLAY=:0 java -jar /root/ct/wmes-ct-qrcamera-0.0.1-jar-with-dependencies.jar \
  --debug 1 \
  --gui 1 \
  --size 640x480 \
  --delay-ok 1 \
  --delay-nok 1
