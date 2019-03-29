/**
 * FileName: common.cert.ipin.refund.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';
import FormatHelper from '../../../../utils/format.helper';

class CommonCertIpinRefund extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const authKind = req.query.authKind;
    const params = {
      resultUrl: 'https://' + this.loginService.getDns() + '/common/cert/result?type=ipin&kind=' + authKind,
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + + authKind,
    };
    this.apiService.request(API_CMD.BFF_01_0047, params).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.ipin.html', { data: resp.result, pageInfo });
      } else {
        res.redirect('/common/inapp/error?code=' + resp.code + '&msg=' + resp.msg);
      }
    });
  }
}

export default CommonCertIpinRefund;
