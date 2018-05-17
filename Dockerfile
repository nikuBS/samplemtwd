# Node.js app Docker file

# Linux dependencies
FROM ubuntu:16.04

RUN apt-get -qq update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get install -y nodejs

VOLUME ["/tworld"]

ADD . /tworld
RUN cd /tworld && npm install

# open Application port
EXPOSE 3000

WORKDIR /tworld

CMD ["npm", "run", "server-dev"]