# Node.js app Docker file

# Linux dependencies
FROM mycluster.icp:8500/default/nodejs8-centos:0.1

WORKDIR /tworld

COPY package*.json ./

# set npm proxy & registry
RUN npm config set proxy http://devops.tworld.co.kr:80
RUN npm config set https-proxy http://devops.tworld.co.kr:80
RUN npm config set registry http://devops.tworld.co.kr/myrepo/content/groups/npm-group/
RUN npm config set strict-ssl false

# npm & pm2 install
RUN npm --verbose install
RUN npm --verbose install -g pm2
RUN npm --verbose install -g gulp
RUN npm --verbose install -g redis-cli
RUN pm2 install typescript

COPY . .

ENV NODE_ENV k8s

# open Application port
EXPOSE 3000

CMD ["npm", "run", "server-docker:qa"]
