#!/bin/bash

chmod +x /root/*.sh \
         /root/xiconf/bin/*.sh \
         /root/xiconf/bin/corescanner-console-app \
         /root/ct/*.sh

chmod -R +w /root/server/config.json \
            /root/server/localStorage.json \
            /root/ct/balluff.json \
            /root/ps-load/buffer.json \
            /root/xiconf/data
