#!/bin/bash

killall node >/dev/null 2>&1
node /root/server/server.js >>/root/log/server.txt 2>&1 &
