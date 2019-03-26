# Node.js app Docker file
ARG DOCKER_REGISTRY
# Linux dependencies
FROM ${DOCKER_REGISTRY}/infra/nodejs8-centos:0.1
#FROM node:carbon

WORKDIR /tworld

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