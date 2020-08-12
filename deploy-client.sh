#!/bin/sh
DIST=mtw-cdn.tar.gz

gulp build

pushd dist
tar zxf ../../bff/adminupload.tar.gz
tar zcf ../$DIST adminupload css img/product js manifest.json
popd
scp $DIST xrath.com:data/mtw/dist/cdn
rm $DIST
ssh xrath.com "cd data/mtw/dist/cdn && tar zxvf $DIST && rm -f $DIST"
