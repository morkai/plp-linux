#!/bin/bash

cd /root/custom-img
mkdir mnt
mkdir extract
mount -o loop ubuntu-16.04.1-server-amd64.iso mnt
rsync --exclude=/install/filesystem.squashfs -a mnt/ extract
unsquashfs mnt/install/filesystem.squashfs
mv squashfs-root edit

echo 01-build-new > /root/custom-img/00-build-current.txt
