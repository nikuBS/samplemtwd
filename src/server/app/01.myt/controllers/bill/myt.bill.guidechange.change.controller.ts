/**
 * FileName: myt.bill.guidechange.change.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { BILL_GUIDE_TYPE_NAME, BILL_GUIDE_SELECTOR_LABEL } from '../../../../types/string.type';

const BILL_GUIDE_TYPE_COMPONENT = {};
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD] = 'tworld';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS] = 'sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL] = 'email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC] = 'etc';

const defaultBillGuideTypes = [{
  curBillType: BILL_GUIDE_TYPE.TWORLD,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.TWORLD,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.TWORLD
}, {
  curBillType: BILL_GUIDE_TYPE.EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.EMAIL
}, {
  curBillType: BILL_GUIDE_TYPE.ETC,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.ETC,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.ETC
}];

const mixedBillGuidetypes = defaultBillGuideTypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER
}, {
  curBillType: BILL_GUIDE_TYPE.SMS,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.SMS,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.SMS
}, {
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER_EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER_EMAIL
}, {
  curBillType: BILL_GUIDE_TYPE.SMS_EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.SMS_EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.SMS_EMAIL
}]);

const cellPhoneBillGuideTypes = mixedBillGuidetypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_SMS,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER_SMS,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER_SMS
}]);


class MyTBillChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // 임시 - 휴대폰, T-WiBro, 인터넷 등등에 따라 값이 달라져야함
    const BillGuideTypes = cellPhoneBillGuideTypes;
    let curBillType = BillGuideTypes.find((_billType) => {
      return _billType.curBillType === req.query.curBillTypeCd;
    });
    if ( !curBillType ) {
      curBillType = BillGuideTypes[0];
    }
    this.renderView(res, 'bill/myt.bill.guidechange.change.html', {
      curBillType: curBillType,
      curBillTypeData: JSON.stringify(curBillType),
      billGuideTypesData: JSON.stringify(BillGuideTypes),
      isGuideSelect: true
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

}

export default MyTBillChange;


