/**
 * FileName: common.share.landing.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import ParamsHelper from '../../../../utils/params.helper';

class CommonShareLanding extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const url = decodeURIComponent(req.query.url);

    if ( url.indexOf('mtworldapp2://') !== -1 ) {
      const result = ParamsHelper.getQueryParams(url);
      res.render('share/common.share.landing.html', { result, isLogin: !FormatHelper.isEmpty(svcInfo), pageInfo});
    } else {
      res.json(url);
    }
  }
}

export default CommonShareLanding;
