/**
 * FileName: myt.bill.guidechange.change.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';

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
  curBillTypeNm: 'T world 확인',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD],
  selectorLabel: 'T world 확인 추천!'
}, {
  curBillType: BILL_GUIDE_TYPE.EMAIL,
  curBillTypeNm: '이메일',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL],
  selectorLabel: '이메일 요금안내서'
}, {
  curBillType: BILL_GUIDE_TYPE.ETC,
  curBillTypeNm: '기타(우편)',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC],
  selectorLabel: '기타(우편) 요금안내서'
}];

const mixedBillGuidetypes = defaultBillGuideTypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER,
  curBillTypeNm: 'Bill Letter',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER],
  selectorLabel: 'Bill Letter'
}, {
  curBillType: BILL_GUIDE_TYPE.SMS,
  curBillTypeNm: '문자',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS],
  selectorLabel: '문자 요금안내서'
}, {
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_EMAIL,
  curBillTypeNm: 'Bill letter + 이메일',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL],
  selectorLabel: 'Bill Letter + 이메일 요금안내서'
}, {
  curBillType: BILL_GUIDE_TYPE.SMS_EMAIL,
  curBillTypeNm: '문자 + 이메일',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL],
  selectorLabel: '문자 + 이메일 요금안내서'
}]);

const cellPhoneBillGuideTypes = mixedBillGuidetypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_SMS,
  curBillTypeNm: 'Bill letter + 문자',
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS],
  selectorLabel: 'Bill Letter + 문자 요금안내서'
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


