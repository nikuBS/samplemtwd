/**
 * FileName: test.cert-sms.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import BrowserHelper from '../../../utils/browser.helper';

export default class TestCertSmsController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const jobCode = BrowserHelper.isApp(req) ? 'NFM_MTW_CMNBSNS_AUTH' : 'NFM_MWB_CMNBSNS_AUTH';
    this.apiService.request(API_CMD.BFF_01_0014, {
      jobCode: jobCode
    }).subscribe((resp) => {
      res.render('test.cert-sms.html', { result: resp });
    });
  }
}
