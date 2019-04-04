/**
 * @file common.cert.nice.refund.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';

class CommonCertNiceRefund extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const mobileco = req.query.niceKind;
    const authKind = req.query.authKind;
    this.apiService.request(API_CMD.BFF_01_0049, {
      mobileco,
      resultUrl: 'https://' + this.loginService.getDns(req) + '/common/cert/result?type=nice&kind=' + authKind
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + + authKind
    }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.nice.html', { data: resp.result, pageInfo });
      } else {
        res.redirect('/common/inapp/error?code=' + resp.code + '&msg=' + resp.msg);
      }
    });
  }
}

export default CommonCertNiceRefund;
