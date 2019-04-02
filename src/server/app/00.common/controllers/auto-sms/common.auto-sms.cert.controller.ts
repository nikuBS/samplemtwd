/**
 * FileName: common.auto-sms.cert.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { NODE_API_ERROR } from '../../../../types/string.type';

class CommonAutoSmsCert extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    let encParam = req.query.p;
    if ( encParam.indexOf('(') !== -1 ) {
      encParam = encParam.split('(')[0];
    }
    if ( FormatHelper.isEmpty(encParam) ) {
      this.error.render(res, {
        code: '',
        msg: NODE_API_ERROR['01'],
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    } else {
      res.render('auto-sms/common.auto-sms.cert.html', { pageInfo, encParam });
    }
  }
}

export default CommonAutoSmsCert;
