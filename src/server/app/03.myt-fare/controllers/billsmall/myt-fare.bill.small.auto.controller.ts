/**
 * FileName: myt-fare.bill.small.auto.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.05
 * Annotation: 소액결제 자동선결제 신청
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillSmallAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) {
      this.getAutoPrepayInfo().subscribe((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          res.render('billsmall/myt-fare.bill.small.auto.html', {
            autoPrepayInfo: this.parseData(resp.result),
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        } else {
          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  private getAutoPrepayInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0086, {});
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.comboStandardAmount = result.cmbAutoChrgStrdAmt / 10000;
      result.comboChargeAmount = result.cmbAutoChrgAmt / 10000;
      result.comboMaxAmount = result.cmbMaxAmt / 10000;
    }
    return result;
  }
}

export default MyTFareBillSmallAuto;
