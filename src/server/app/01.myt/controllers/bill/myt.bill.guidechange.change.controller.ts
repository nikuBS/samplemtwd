/**
 * FileName: myt.bill.guidechange.change.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_TYPE } from '../../../../types/bff-common.type';

const defaultBillTypes = [{
  code: BILL_TYPE.TWORLD,
  component: 'tworld',
  label: 'T world 확인',
  selectorLabel: 'T world 확인 추천!'
}, {
  code: BILL_TYPE.EMAIL,
  component: 'email',
  label: '이메일',
  selectorLabel: '이메일 요금안내서'
}, {
  code: BILL_TYPE.ETC,
  component: 'etc',
  label: '기타(우편)',
  selectorLabel: '기타(우편) 요금안내서'
}];

const mixedBilltype = defaultBillTypes.concat([{
  code: BILL_TYPE.BILL_LETTER,
  component: 'bill-letter',
  label: 'Bill Letter',
  selectorLabel: 'Bill Letter'
}, {
  code: BILL_TYPE.SMS,
  component: 'sms',
  label: '문자',
  selectorLabel: '문자 요금안내서'
}, {
  code: BILL_TYPE.BILL_LETTER_EMAIL,
  component: 'bill-letter-email',
  label: 'Bill letter + 이메일',
  selectorLabel: 'Bill Letter + 이메일 요금안내서'
}, {
  code: BILL_TYPE.SMS_EMAIL,
  component: 'sms-email',
  label: '문자 + 이메일',
  selectorLabel: '문자 + 이메일 요금안내서'
}]);

const cellPhoneBillTypes = mixedBilltype.concat([{
  code: BILL_TYPE.BILL_LETTER_SMS,
  component: 'bill-letter-sms',
  label: 'Bill letter + 문자',
  selectorLabel: 'Bill Letter + 문자 요금안내서'
}]);


class MyTBillChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // 임시 - 휴대폰, T-WiBro, 인터넷 등등에 따라 값이 달라져야함
    const billTypes = defaultBillTypes;
    let curBillType = billTypes.find((_billType) => {
      return _billType.code === req.query.curBillTypeCd;
    });
    if ( !curBillType ) {
      curBillType = billTypes[0];
    }
    this.renderView(res, 'bill/myt.bill.guidechange.change.html', {
      curBillType: curBillType,
      billTypes: billTypes
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

}

export default MyTBillChange;


