/**
 * FileName: myt.bill.guidechange.update-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.13
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { BILL_GUIDE_TYPE_NAME } from '../../../../types/string.type';
import curBillGuide from '../../../../mock/server/myt.bill.guidechange.bill-types-list';
import { API_CODE } from '../../../../types/api-command.type';

const BillGuideLabelDefines = {};
BillGuideLabelDefines[BILL_GUIDE_TYPE.TWORLD] = BILL_GUIDE_TYPE_NAME.TWORLD;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER] = BILL_GUIDE_TYPE_NAME.BILL_LETTER;
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS] = BILL_GUIDE_TYPE_NAME.SMS;
BillGuideLabelDefines[BILL_GUIDE_TYPE.EMAIL] = BILL_GUIDE_TYPE_NAME.EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = BILL_GUIDE_TYPE_NAME.BILL_LETTER_EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS_EMAIL] = BILL_GUIDE_TYPE_NAME.SMS_EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = BILL_GUIDE_TYPE_NAME.BILL_LETTER_SMS;
BillGuideLabelDefines[BILL_GUIDE_TYPE.ETC] = BILL_GUIDE_TYPE_NAME.ETC;

const BILL_GUIDE_TYPE_COMPONENT = {};
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD] = 'tworld';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS] = 'sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL] = 'email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC] = 'etc';

class MyTBillChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    svcInfo.svcAttrCd = 'S1';

    const _curBillGuide = this.getResult(curBillGuide);
    this.renderView(res, 'bill/myt.bill.guidechange.update-complete.html', {
      svcInfo: svcInfo,
      curBillGuide: _curBillGuide,
      component: BILL_GUIDE_TYPE_COMPONENT[_curBillGuide.curBillType]
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

export default MyTBillChange;


