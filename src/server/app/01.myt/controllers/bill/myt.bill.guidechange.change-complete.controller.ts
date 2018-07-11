/**
 * FileName: myt.bill.guidechange.change-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.06
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { BILL_GUIDE_TYPE_NAME } from '../../../../types/string.type';

const BillGuideLabelDefines = {};
BillGuideLabelDefines[BILL_GUIDE_TYPE.TWORLD] = BILL_GUIDE_TYPE_NAME.TWORLD;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER] = BILL_GUIDE_TYPE_NAME.BILL_LETTER;
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS] = BILL_GUIDE_TYPE_NAME.SMS;
BillGuideLabelDefines[BILL_GUIDE_TYPE.EMAIL] = BILL_GUIDE_TYPE_NAME.EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = BILL_GUIDE_TYPE_NAME.BILL_LETTER_EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS_EMAIL] = BILL_GUIDE_TYPE_NAME.SMS_EMAIL;
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = BILL_GUIDE_TYPE_NAME.BILL_LETTER_SMS;
BillGuideLabelDefines[BILL_GUIDE_TYPE.ETC] = BILL_GUIDE_TYPE_NAME.ETC;

class MyTBillChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.renderView(res, 'bill/myt.bill.guidechange.change-complete.html', {
      beforeBillGuideLabel: BillGuideLabelDefines[req.query.beforeBillTypeCd],
      afterBillGuideLabel: BillGuideLabelDefines[req.query.afterBillTypeCd]
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

}

export default MyTBillChange;


