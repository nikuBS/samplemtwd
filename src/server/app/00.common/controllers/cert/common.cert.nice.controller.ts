/**
 * FileName: common.cert.nice.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';

class CommonCertNice extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const mobileco = req.query.niceKind;
    const authUrl = decodeURIComponent(req.query.authUrl);
    const authKind = req.query.authKind;
    const prodAuthKey = decodeURIComponent(req.query.prodAuthKey) || ''; // 상품인증이 있는 경우
    this.apiService.request(API_CMD.BFF_01_0024, {
      mobileco,
      authUrl,
      resultUrl:  'https://' + this.loginService.getDns() + '/common/cert/result?type=nice&kind=' + authKind,
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + + authKind,
      authKind,
      prodAuthKey
    }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.nice.html', { data: resp.result, pageInfo });
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo,
          svcInfo
        });
      }
    });
  }
}

export default CommonCertNice;
