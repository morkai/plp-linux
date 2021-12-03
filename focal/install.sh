cd /root
mkdir custom-img
cd custom-img
export ROOT=$(pwd)
export DIST=focal
export GIST=https://gist.githubusercontent.com/morkai/ed2a240d6d426bbab8cf7233a4a3a082/raw/6a830536706b9d284ee485d0957d338622c22de2
apt-get update
apt-get install -y nano curl wget build-essential p7zip-full git-core cmake software-properties-common squashfs-tools genisoimage gnupg fakeroot debhelper debian-keyring
mkdir -p mnt build indices apt-ftparchive
wget http://cdimage.ubuntu.com/ubuntu/releases/20.04/release/ubuntu-20.04.3-live-server-amd64.iso
ln ubuntu-20.04.3-live-server-amd64.iso input.iso
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
dpkg-buildpackage -rfakeroot -m"Lukasz Walukiewicz <lukasz@miracle.systems>" -k$KEY
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
cd ../apt-ftparchive
# Copy apt-ftparchive...

cd
cd custom-img
./enter.sh
/enter.sh
echo "deb http://pl.archive.ubuntu.com/ubuntu/ focal main restricted
deb http://pl.archive.ubuntu.com/ubuntu/ focal-updates main restricted
deb http://pl.archive.ubuntu.com/ubuntu/ focal universe
deb http://pl.archive.ubuntu.com/ubuntu/ focal-updates universe
deb http://pl.archive.ubuntu.com/ubuntu/ focal multiverse
deb http://pl.archive.ubuntu.com/ubuntu/ focal-updates multiverse
deb http://pl.archive.ubuntu.com/ubuntu/ focal-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu focal-security main restricted
deb http://security.ubuntu.com/ubuntu focal-security universe
deb http://security.ubuntu.com/ubuntu focal-security multiverse" > /etc/apt/sources.list
apt update
apt upgrade
apt install -y nano wget curl p7zip-full gnupg ntp xorg x11vnc wpasupplicant wireless-tools net-tools openbox dmidecode openssh-server openssh-client libnss3-tools gdb libelf1 pkg-config libudev-dev bc libappindicator3-1 ttf-mscorefonts-installer software-properties-common expect libasound2 xdg-utils apt-transport-https
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
wget -O- https://apt.corretto.aws/corretto.key | sudo apt-key add -
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
echo "deb [arch=amd64] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-5.0.list
add-apt-repository 'deb https://apt.corretto.aws stable main'
wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb
apt update
apt install -y nodejs java-11-amazon-corretto-jdk mongodb-org dotnet-runtime-5.0
systemctl enable mongod.service
systemctl start mongod.service
dpkg -i /root/google-chrome-stable_84.0.4147.135-1_amd64.deb
dpkg -i /root/zebra-scanner-corescanner_4.4.1-11_amd64.deb
rm *.deb
update-grub
echo "
blacklist dw_dmac
blacklist dw_dmac_core
install dw_dmac /bin/true
install dw_dmac_core /bin/true" >> /etc/modprobe.d/blacklist.conf
update-initramfs -u
/leave.sh
exit

https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu#apt-troubleshooting
