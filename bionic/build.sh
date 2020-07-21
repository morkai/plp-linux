#!/bin/bash

DIST=bionic
NAME=Custom
FILE=output.iso
KEY=$CUSTOM_ISO_KEY
PASS=$CUSTOM_ISO_PASSPHRASE

rm $FILE

cd extract
apt-ftparchive packages ./pool/main/ > dists/stable/main/binary-amd64/Packages
apt-ftparchive packages ./pool/restricted/ > dists/stable/restricted/binary-amd64/Packages
apt-ftparchive packages ./pool/extras/ > dists/stable/extras/binary-amd64/Packages
gzip -c dists/stable/main/binary-amd64/Packages | tee dists/stable/main/binary-amd64/Packages.gz > /dev/null
gzip -c dists/stable/restricted/binary-amd64/Packages | tee dists/stable/restricted/binary-amd64/Packages.gz > /dev/null
gzip -c dists/stable/extras/binary-amd64/Packages | tee dists/stable/extras/binary-amd64/Packages.gz > /dev/null
apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-deb.conf
apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-udeb.conf
apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-extras.conf
apt-ftparchive -c ../apt-ftparchive/release.conf release dists/stable > dists/stable/Release
rm dists/stable/Release.gpg
echo $PASS | gpg --pinentry-mode loopback --batch --yes --passphrase-fd 0 --default-key "$KEY" --output dists/stable/Release.gpg -ba dists/stable/Release
find . -type f -print0 | xargs -0 md5sum > md5sum.txt
cd ../
umount edit/dev
chmod +w extract/install/filesystem.manifest
chroot edit dpkg-query -W --showformat='${Package} ${Version}\n' | tee extract/install/filesystem.manifest
rm extract/install/filesystem.squashfs extract/install/filesystem.size
printf $(du -sx --block-size=1 edit | cut -f1) | tee extract/install/filesystem.size
mksquashfs edit extract/install/filesystem.squashfs -b 1048576
cd extract
rm md5sum.txt
find -type f -print0 | sudo xargs -0 md5sum | grep -v isolinux/boot.cat | tee md5sum.txt
genisoimage -D -r -V "$NAME" -cache-inodes -J -l -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -o ../$FILE .
cd ..
