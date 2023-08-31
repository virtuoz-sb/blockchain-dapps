# init
apt update

# build essentials
apt install -y build-essential

# python
apt install -y python2

# oh my zsh
apt install -y zsh
yes | sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
zsh

# install mongo
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list
apt-get update
apt-get install -y mongodb-org

#start mongo
systemctl start mongod
systemctl enable mongod

# install nginx
apt install -y nginx

# configure nginx
ufw allow 'Nginx HTTPS'

# install nodejs
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | zsh
source ~/.zshrc
nvm install node
nvm use node

# install yarn
npm install --global yarn

# install pm2
npm install --global pm2