/**
 * FileName: common.cert.ipin.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';
import FormatHelper from '../../../../utils/format.helper';

class CommonCertIpin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const authUrl = decodeURIComponent(req.query.authUrl);
    const authKind = req.query.authKind;
    const prodAuthKey = decodeURIComponent(req.query.prodAuthKey) || ''; // 상품인증이 있는 경우
    const params = {
      authUrl,
      resultUrl: 'https://' + this.loginService.getDns(req) + '/common/cert/result?type=ipin&kind=' + authKind,
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + authKind,
      authKind,
      prodAuthKey
    };
    this.apiService.request(API_CMD.BFF_01_0022, params).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.ipin.html', { data: resp.result, pageInfo });
      } else {
        res.redirect('/common/inapp/error?code=' + resp.code + '&msg=' + resp.msg);
      }
    });
  }
}

export default CommonCertIpin;
