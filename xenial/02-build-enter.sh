#!/bin/bash

cd /root/custom-img
cp /etc/resolv.conf edit/etc/
cp 03-build-leave.sh edit/leave.sh
mount --bind /dev/ edit/dev
echo "mount -t proc none /proc" >> edit/enter.sh
echo "mount -t sysfs none /sys" >> edit/enter.sh
echo "mount -t devpts none /dev/pts" >> edit/enter.sh
echo "export HOME=/root" >> edit/enter.sh
echo "export LC_ALL=C" >> edit/enter.sh
echo "dbus-uuidgen > /var/lib/dbus/machine-id" >> edit/enter.sh
echo "dpkg-divert --local --rename --add /sbin/initctl" >> edit/enter.sh
echo "ln -s /bin/true /sbin/initctl" >> edit/enter.sh
chmod +x edit/enter.sh edit/leave.sh

echo 02-build-enter > /root/custom-img/00-build-current.txt

chroot edit
