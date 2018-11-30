/**
 * FileName: common.cert.nice.refund.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import EnvHelper from '../../../../utils/env.helper';

class CommonCertNiceRefund extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const mobileco = req.query.niceKind;
    const authKind = req.query.authKind;
    this.apiService.request(API_CMD.BFF_01_0049, {
      mobileco,
      resultUrl:  EnvHelper.getEnvironment('DOMAIN') + '/common/cert/result?type=nice&kind=' + authKind
      // resultUrl: 'http://150.28.69.23:3000' + '/common/cert/result?type=ipin&kind=' + + authKind
    }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.nice.html', { data: resp.result });
      }
    });
  }
}

export default CommonCertNiceRefund;
