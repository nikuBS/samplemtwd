/**
 * @file common.share.landing.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.05
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

    if ( url.indexOf('mtworldapp2://tworld?') !== -1 ) {
      const result = url.split('tworld?')[1];
      let target = '';
      let loginType = '';
      if ( result.indexOf('&') !== -1 ) {
        target = result.split('&')[0];
        loginType = result.split('&')[1];

      } else {
        target = result;
      }
      target = target.indexOf('target=') !== -1 ? target.split('target=')[1] : '/main/home';
      loginType = loginType.indexOf('loginType=') !== -1 ? loginType.split('loginType=')[1] : 'N';
      res.render('share/common.share.landing.html', { target, loginType, svcInfo, pageInfo });
    } else {
      this.error.render(res, {
        code: '',
        msg: '',
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }
  }
}

export default CommonShareLanding;
