# Node.js app Docker file
ARG DOCKER_REGISTRY
# Linux dependencies
FROM ${DOCKER_REGISTRY}/infra/nodejs8-utf8:1.0.0
#FROM node:carbon

USER appadmin
WORKDIR /home/appadmin

COPY package*.json ./

# set npm proxy & registry
RUN npm config set proxy http://devops.sktelecom.com:80
RUN npm config set https-proxy http://devops.sktelecom.com:80
RUN npm config set registry http://devops.sktelecom.com/myrepo/content/groups/npm-group/
RUN npm config set strict-ssl false

# npm & pm2 install
RUN npm --verbose install
RUN npm --verbose install -g pm2
RUN npm --verbose install -g gulp
RUN pm2 install typescript

COPY . .
RUN gulp build

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