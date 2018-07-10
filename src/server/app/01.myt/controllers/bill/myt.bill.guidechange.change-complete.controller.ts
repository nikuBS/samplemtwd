/**
 * FileName: myt.bill.guidechange.change-complete.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.06
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';

const BillGuideLabelDefines = {};
BillGuideLabelDefines[BILL_GUIDE_TYPE.TWORLD.CODE] = 'T world 확인';
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER.CODE] = 'Bill Letter';
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS.CODE] = '문자';
BillGuideLabelDefines[BILL_GUIDE_TYPE.EMAIL.CODE] = '이메일';
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL.CODE] = 'Bill letter + 이메일';
BillGuideLabelDefines[BILL_GUIDE_TYPE.SMS_EMAIL.CODE] = '문자 + 이메일';
BillGuideLabelDefines[BILL_GUIDE_TYPE.BILL_LETTER_SMS.CODE] = 'Bill letter + 문자';
BillGuideLabelDefines[BILL_GUIDE_TYPE.ETC.CODE] = '기타(우편)';

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


