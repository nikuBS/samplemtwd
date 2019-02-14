/**
 * FileName: common.search.in-result.controller.ts
 * Author: Hyunkuk Lee ( max5500@pineone.com )
 * Date: 2019.02.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import CommonSearch from './common.search.controller';
import CommonSearchMore from './common.search.more.controller';

class CommonSearchInResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( req.query.category ) {
      new CommonSearchMore().initPage(req, res, next);
    } else {
      new CommonSearch().initPage(req, res, next);
    }

  }
}

export default CommonSearchInResult;
