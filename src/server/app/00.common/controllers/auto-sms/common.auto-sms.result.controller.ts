/**
 * FileName: common.auto-sms.result.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class CommonAutoSmsResult extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0200, {})
      .subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          res.render('auto-sms/common.auto-sms.result.html', { pageInfo });
        } else {
          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
  }
}

export default CommonAutoSmsResult;
