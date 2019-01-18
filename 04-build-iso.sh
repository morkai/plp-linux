#!/bin/bash

rm /root/custom-img/plp-up-v0.iso

cd /root/custom-img/extract
apt-ftparchive packages ./pool/main/ > dists/xenial/main/binary-amd64/Packages
apt-ftparchive packages ./pool/restricted/ > dists/xenial/restricted/binary-amd64/Packages
apt-ftparchive packages ./pool/extras/ > dists/xenial/extras/binary-amd64/Packages
gzip -c dists/xenial/main/binary-amd64/Packages | tee dists/xenial/main/binary-amd64/Packages.gz > /dev/null
gzip -c dists/xenial/restricted/binary-amd64/Packages | tee dists/xenial/restricted/binary-amd64/Packages.gz > /dev/null
gzip -c dists/xenial/extras/binary-amd64/Packages | tee dists/xenial/extras/binary-amd64/Packages.gz > /dev/null

apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-deb.conf
apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-udeb.conf
apt-ftparchive -c ../apt-ftparchive/release.conf generate ../apt-ftparchive/apt-ftparchive-extras.conf
apt-ftparchive -c ../apt-ftparchive/release.conf release dists/xenial > dists/xenial/Release
rm dists/xenial/Release.gpg
gpg --batch --passphrase $BUILD_ISO_PASSPHRASE --default-key "ECF415D4" --output dists/xenial/Release.gpg -ba dists/xenial/Release
find . -type f -print0 | xargs -0 md5sum > md5sum.txt

cd /root/custom-img
umount edit/dev
chmod +w extract/install/filesystem.manifest
chroot edit dpkg-query -W --showformat='${Package} ${Version}\n' | tee extract/install/filesystem.manifest
rm extract/install/filesystem.squashfs extract/install/filesystem.size
printf $(du -sx --block-size=1 edit | cut -f1) | tee extract/install/filesystem.size
mksquashfs edit extract/install/filesystem.squashfs -b 1048576
cd extract
rm md5sum.txt
find -type f -print0 | sudo xargs -0 md5sum | grep -v isolinux/boot.cat | tee md5sum.txt
genisoimage -D -r -V "PLPUPv0" -cache-inodes -J -l -b isolinux/isolinux.bin -c isolinux/boot.cat -no-emul-boot -boot-load-size 4 -boot-info-table -o ../plp-up-v0.iso .
cd ..

echo 04-build-iso > /root/custom-img/00-build-current.txt
