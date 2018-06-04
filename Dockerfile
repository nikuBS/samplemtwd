# Node.js app Docker file

# Linux dependencies
#FROM ubuntu:16.04
FROM mycluster.icp:8500/default/nodejs8-centos:0.1
#FROM node:carbon

#RUN apt-get -qq update && apt-get install -y curl
#RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
#RUN bash nodesource_setup.sh
#RUN apt-get install -y nodejs

WORKDIR /tworld

ADD . /tworld
RUN cd /tworld && npm install
RUN npm install -g pm2
RUN pm2 install typescript

ENV NODE_ENV k8s

# open Application port
EXPOSE 3000

CMD ["npm", "run", "server-docker:qa"]