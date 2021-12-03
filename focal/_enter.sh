#!/bin/bash

mount -t proc none /proc
mount -t sysfs none /sys
mount -t devpts none /dev/pts
export HOME=/root
export LC_ALL=C
rm -rf /etc/machine-id /var/lib/dbus/machine-id
dbus-uuidgen --ensure=/etc/machine-id
dbus-uuidgen --ensure
dpkg-divert --local --rename --add /sbin/initctl
ln -s /bin/true /sbin/initctl
