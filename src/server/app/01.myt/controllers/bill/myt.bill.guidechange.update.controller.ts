/**
 * FileName: myt.bill.guidechange.update.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE } from '../../../../types/api-command.type';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { API_CMD } from '../../../../types/api-command.type';
import curBillGuide from '../../../../mock/server/myt.bill.guidechange.bill-types-list';
import { Observable } from 'rxjs/Observable';
import { PARAM } from './myt.bill.hotbill.controller';

const BILL_GUIDE_TYPE_COMPONENT = {};
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD] = 'tworld';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS] = 'sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL] = 'email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC] = 'etc';

class MyTBillUpdate extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0025, {})
    ).subscribe(([billTypesList]) => {
      const _curBillGuide = this.getResult(billTypesList);
      // console.log('~~~~~~`_curBillGuide', _curBillGuide);
      // console.log('~~~~~~`svcInfo', svcInfo);
      if (!svcInfo.svcAttrCd) {
        svcInfo.svcAttrCd = 'M1';
      }
      const anotherBillGuideType = (_curBillGuide.curBillType === BILL_GUIDE_TYPE.TWORLD) ? BILL_GUIDE_TYPE.BILL_LETTER : BILL_GUIDE_TYPE.TWORLD;
      _curBillGuide['component'] = BILL_GUIDE_TYPE_COMPONENT[_curBillGuide['curBillType']];
      _curBillGuide['svcInfo'] = svcInfo;
      this.renderView(res, 'bill/myt.bill.guidechange.update.html', {
        curBillGuide: _curBillGuide,
        curBillGuideData: JSON.stringify(_curBillGuide),
        isUpdate: true,
        anotherBillGuideType: anotherBillGuideType
      });
    });


  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

  private getResult(resp: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      return resp.result;
    }
    return resp;
  }

}

export default MyTBillUpdate;
