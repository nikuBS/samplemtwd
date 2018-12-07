/**
 * FileName: common.share.landing.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonShareLanding extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const url = decodeURIComponent(req.query.url);

    if ( url.indexOf('mtworldapp2://') !== -1 ) {
      const urlInfo = url.split('?')[1];
      let urlArr = <any>[];
      if ( urlInfo.indexOf('&') !== -1 ) {
        urlArr = urlInfo.split('&');
      } else {
        urlArr.push(urlInfo);
      }
      const result = {};
      urlArr.map((target) => {
        result[target.split('=')[0]] = target.split('=')[1];
      });
      res.render('share/common.share.landing.html', { result, isLogin: !FormatHelper.isEmpty(svcInfo) });
    } else {
      res.json(url);
    }
  }
}

export default CommonShareLanding;
