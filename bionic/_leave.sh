#!/bin/bash

apt autoremove -y
apt clean -y
rm -rf /tmp/* ~/.bash_history /enter.sh /leave.sh
rm /var/lib/dbus/machine-id /etc/machine-id
rm /sbin/initctl
touch /etc/machine-id
dpkg-divert --rename --remove /sbin/initctl
umount /proc || umount -lf /proc
umount /sys
umount /dev/pts
