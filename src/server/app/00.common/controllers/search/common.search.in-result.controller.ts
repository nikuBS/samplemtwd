/**
 * FileName: common.search.in-result.controller.ts
 * Author: Hyunkuk Lee ( max5500@pineone.com )
 * Date: 2019.02.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import url from 'url';

class CommonSearchInResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( req.query.category ) {
      res.redirect(url.format({
        pathname : '/common/search/more',
        query : req.query,
      }));
    } else {
      res.redirect(url.format({
        pathname : '/common/search',
        query : req.query,
      }));
    }

  }
}

export default CommonSearchInResult;
