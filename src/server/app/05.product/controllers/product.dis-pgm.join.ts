/*
 * FileName: product.dis-pgm.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class ProductDisPgmJoin extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.params.prodId || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };

    if ( prodId === 'NA00004430' ) {
      res.render('product.sel-contract.input.html', { data });
    } else {
      // NA00002079, NA00002082, NA00002080, NA00002081
      switch ( prodId ) {
        case 'NA00002079':
          // 2년이상
          data.percent = '65';
          break;
        case 'NA00002082':
          // 3년이상
          data.percent = '70';
          break;
        case 'NA00002080':
          // 5년이상
          data.percent = '75';
          break;
        case 'NA00002081':
          // 10년이상
          data.percent = '80';
          break;
      }
      res.render('product.t-plus.input.html', { data });
    }
  }
}

export default ProductDisPgmJoin;
