#!/bin/sh
DIST=mtw-server.tar.gz
tar --exclude "src/client/" -zcf $DIST gulpfile.js nodemon.json nodejs-exporter.js package* src ts*
scp $DIST xrath.com:data/mtw/
rm $DIST
ssh xrath.com "cd data/mtw && tar zxvf $DIST && rm $DIST && sed -i 's/localhost:3001/mtw.yellowchamber.com\/cdn/g' src/server/config/environment.config.ts"

