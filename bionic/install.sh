#!/bin/bash

cd /root
mkdir custom-img
cd custom-img
export ROOT=$(pwd)
export DIST=bionic
export GIST=https://gist.githubusercontent.com/morkai/ed2a240d6d426bbab8cf7233a4a3a082/raw/26933c846fca7c45662dacaea47bc27c7f934f2d
apt-get update
apt-get install -y nano curl wget build-essential p7zip-full git-core cmake software-properties-common squashfs-tools genisoimage gnupg fakeroot debhelper debian-keyring
mkdir -p mnt build indices apt-ftparchive
wget http://cdimage.ubuntu.com/ubuntu/releases/18.04/release/ubuntu-18.04.3-server-amd64.iso
ln ubuntu-18.04.3-server-amd64.iso input.iso
mount -o loop input.iso mnt
rsync --exclude=/install/filesystem.squashfs -a mnt/ extract
unsquashfs mnt/install/filesystem.squashfs
mv squashfs-root edit
mkdir -p extract/dists/stable/extras/binary-amd64 extract/pool/extras extract/pool/restricted
wget $GIST/build.sh
wget $GIST/enter.sh
wget $GIST/_enter.sh
wget $GIST/_leave.sh
chmod +x enter.sh build.sh
# Real name: Custom Signing Key
gpg --full-generate-key
export KEY=$(gpg --list-keys "Custom Signing Key" | sed -n 2p | xargs)
cd build
apt-get source ubuntu-keyring
export KEYRING=$(ls -d ubuntu-keyring-*/ | xargs -n 1 | sed -n 1p)
cd ${KEYRING}keyrings/
gpg --import < ubuntu-archive-keyring.gpg
gpg --export 790BC7277767219C42C86F933B4FE6ACC0B21F32 843938DF228D22F7B3742BC0D94AA3F0EFE21092 F6ECB3762474EDA9D21B7022871920D1991BC93C $KEY > ubuntu-archive-keyring.gpg
cd ..
cat keyrings/ubuntu-archive-keyring.gpg | sha512sum
...replace checksum in SHA512SUMS.txt.asc...
dpkg-buildpackage -rfakeroot -m"Custom Signee <custom@segnee.name>" -k$KEY
cd ..
cp ubuntu-keyring*deb ../extract/pool/main/u/ubuntu-keyring
cd ..
cp build/${KEYRING}keyrings/ubuntu-archive-keyring.gpg edit/usr/share/keyrings/ubuntu-archive-keyring.gpg
cp build/${KEYRING}keyrings/ubuntu-archive-keyring.gpg edit/etc/apt/trusted.gpg
mkdir -p edit/var/lib/apt/keyrings/
cp build/${KEYRING}keyrings/ubuntu-archive-keyring.gpg edit/var/lib/apt/keyrings/ubuntu-archive-keyring.gpg
cd indices
for SUFFIX in extra.main main main.debian-installer restricted restricted.debian-installer; do
  wget http://archive.ubuntu.com/ubuntu/indices/override.$DIST.$SUFFIX
done

cd
cd custom-img
./enter.sh
/enter.sh
echo "deb http://pl.archive.ubuntu.com/ubuntu/ bionic main restricted
deb http://pl.archive.ubuntu.com/ubuntu/ bionic-updates main restricted
deb http://pl.archive.ubuntu.com/ubuntu/ bionic universe
deb http://pl.archive.ubuntu.com/ubuntu/ bionic-updates universe
deb http://pl.archive.ubuntu.com/ubuntu/ bionic multiverse
deb http://pl.archive.ubuntu.com/ubuntu/ bionic-updates multiverse
deb http://pl.archive.ubuntu.com/ubuntu/ bionic-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu bionic-security main restricted
deb http://security.ubuntu.com/ubuntu bionic-security universe
deb http://security.ubuntu.com/ubuntu bionic-security multiverse" > /etc/apt/sources.list
apt update
apt upgrade
apt install -y nano wget curl p7zip-full unzip gnupg ntp xorg x11vnc wireless-tools net-tools openbox dmidecode openssh-server openssh-client git build-essential apt-transport-https
wget -qO - https://www.mongodb.org/static/pgp/server-4.2.asc | apt-key add -
wget -qO - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
curl -sL https://deb.nodesource.com/setup_12.x | bash -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
echo "deb [arch=amd64] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" > /etc/apt/sources.list.d/mongodb-org-4.2.list
apt update
apt install -y google-chrome-stable nodejs java-common mongodb-org

# Amazon Corretto Java 11
wget https://d3pxv6yz143wms.cloudfront.net/11.0.5.10.1/java-11-amazon-corretto-jdk_11.0.5.10-1_amd64.deb
deb -i java-11-amazon-corretto-jdk_11.0.5.10-1_amd64.deb
rm java-11-amazon-corretto-jdk_11.0.5.10-1_amd64.deb

# .NET Core 3.0 runtime
wget https://packages.microsoft.com/config/ubuntu/18.04/packages-microsoft-prod.deb
deb -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
apt update
apt install install dotnet-runtime-3.0

systemctl enable mongod.service
systemctl start mongod.service

/leave.sh
exit


