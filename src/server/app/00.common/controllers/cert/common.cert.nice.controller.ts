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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const mobileco = req.query.niceType;
    const authUrl = req.query.authUrl;
    const resultUrl = req.query.resultUrl;
    this.apiService.request(API_CMD.BFF_01_0024, {
      mobileco,
      authUrl,
      resultUrl:  EnvHelper.getEnvironment('DOMAIN') + resultUrl
    }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        res.render('cert/common.cert.nice.html', { data: resp.result });
      }
    });
  }
}

export default CommonCertNice;
