#!/bin/bash

cp /etc/resolv.conf edit/etc/
cp _enter.sh edit/enter.sh
cp _leave.sh edit/leave.sh
chmod +x edit/enter.sh edit/leave.sh

mount --bind /dev/ edit/dev

chroot edit
