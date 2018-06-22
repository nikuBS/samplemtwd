# Node.js app Docker file

# Linux dependencies
FROM mycluster.icp:8500/default/nodejs8-centos:0.1
#FROM node:carbon

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
RUN pm2 install typescript

COPY . .

ARG NODE=development
ENV NODE_ENV ${NODE}

# open Application port
EXPOSE 3000

RUN echo "${NODE_ENV}"

CMD ["npm", "run", "server-docker"]