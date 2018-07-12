/**
 * FileName: myt.bill.guidechange.change.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { BILL_GUIDE_TYPE_NAME, BILL_GUIDE_SELECTOR_LABEL } from '../../../../types/string.type';
import { API_CODE } from '../../../../types/api-command.type';
import curBillGuide from '../../../../mock/server/myt.bill.guidechange.bill-types-list';

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
    const _curBillGuide = this.getResult(curBillGuide);
    // 임시 - 휴대폰, T-WiBro, 인터넷 등등에 따라 값이 달라져야함
    const billGuideTypes = cellPhoneBillGuideTypes.map((billGuideType) => {
      billGuideType['kidsYn'] = _curBillGuide['kidsYn'];
      billGuideType['beforeBillType'] = _curBillGuide['curBillType'];
      return billGuideType;
    });

    this.renderView(res, 'bill/myt.bill.guidechange.change.html', {
      billGuideTypes: billGuideTypes,
      billGuideTypesData: JSON.stringify(billGuideTypes),
      isUpdate: false
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


