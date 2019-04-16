/**
 * @file common.auto-sms.cert.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.03.14
 * @desc Common > 스윙자동문자발송 (모 Web전용)
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { NODE_API_ERROR } from '../../../../types/string.type';

/**
 * @desc 스윙자동문자 - SMS인증 초기화를 위한 class
 */
class CommonAutoSmsCert extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > 스윙자동문자발송 > SMS인증 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
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
