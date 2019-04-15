/**
 * @file common.cert.nice.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.08.23
 * @desc Common > 인증 > NICE
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';

/**
 * @desc Nice 인증 초기화를 위한 class
 */
class CommonCertNice extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > 인증 > NICE 인증 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const mobileco = req.query.niceKind;
    const authUrl = decodeURIComponent(req.query.authUrl);
    const authKind = req.query.authKind;
    const prodAuthKey = decodeURIComponent(req.query.prodAuthKey) || ''; // 상품인증이 있는 경우
    this.apiService.request(API_CMD.BFF_01_0024, {
      mobileco,
      authUrl,
      resultUrl:  'https://' + this.loginService.getDns(req) + '/common/cert/result?type=nice&kind=' + authKind,
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + + authKind,
      authKind,
      prodAuthKey
    }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.nice.html', { data: resp.result, pageInfo });
      } else {
        res.redirect('/common/inapp/error?code=' + resp.code + '&msg=' + resp.msg);
      }
    });
  }
}

export default CommonCertNice;
