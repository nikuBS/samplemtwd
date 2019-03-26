# Node.js app Docker file
ARG DOCKER_REGISTRY

# Linux dependencies
FROM ${DOCKER_REGISTRY}/infra/nodejs8-centos:0.1

#FROM node:carbon
WORKDIR /tworld
COPY package*.json ./
 
# set npm proxy & registry
RUN npm config set proxy http://devops.sktelecom.com:80
RUN npm config set https-proxy http://devops.sktelecom.com:80
RUN npm config set registry http://devops.sktelecom.com/myrepo/content/groups/npm-group/
RUN npm config set strict-ssl false
 
RUN npm --verbose install -g pm2
RUN pm2 install typescript
 
COPY . .
 
ARG NODE=dev
ENV NODE_ENV ${NODE}
ENV WHATAP_CONF whatap-${NODE}
ARG VER
ENV NODE_VER ${VER}
 
# open Application port
EXPOSE 3000
RUN echo "${NODE_ENV}"
RUN echo "${WHATAP_CONF}"
RUN echo "${VER}"
CMD ["npm", "run", "server-docker"]