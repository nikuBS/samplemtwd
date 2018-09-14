/**
 * FileName: myt.bill.guidechange.change.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { BILL_GUIDE_TYPE, SVC_ATTR, WIRE_BILL_GUIDE_TYPE } from '../../../../types/bff.old.type';
import { BILL_GUIDE_TYPE_NAME, BILL_GUIDE_SELECTOR_LABEL } from '../../../../types/string.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

const BILL_GUIDE_TYPE_COMPONENT = {};
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD] = 'tworld';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS] = 'sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL] = 'email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC] = 'etc';

BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.TWORLD] = 'tworld';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.BILL_LETTER] = 'bill-letter';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.SMS] = 'sms';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.EMAIL] = 'email';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.BILL_LETTER_EMAIL] = 'bill-letter-email';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.SMS_EMAIL] = 'sms-email';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.BILL_LETTER_SMS] = 'bill-letter-sms';
BILL_GUIDE_TYPE_COMPONENT[WIRE_BILL_GUIDE_TYPE.ETC] = 'etc';

const defaultBillGuideTypes = [{
  curBillType: BILL_GUIDE_TYPE.TWORLD,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.TWORLD,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.TWORLD],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.TWORLD,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.TWORLD
}, {
  curBillType: BILL_GUIDE_TYPE.EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.EMAIL,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.EMAIL
}, {
  curBillType: BILL_GUIDE_TYPE.ETC,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.ETC,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.ETC],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.ETC,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.ETC
}];

const mixedBillGuidetypes = defaultBillGuideTypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.BILL_LETTER
}, {
  curBillType: BILL_GUIDE_TYPE.SMS,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.SMS,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.SMS,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.SMS
}, {
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER_EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER_EMAIL,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.BILL_LETTER_EMAIL
}, {
  curBillType: BILL_GUIDE_TYPE.SMS_EMAIL,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.SMS_EMAIL,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.SMS_EMAIL],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.SMS_EMAIL,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.SMS_EMAIL
}]);

const cellPhoneBillGuideTypes = mixedBillGuidetypes.concat([{
  curBillType: BILL_GUIDE_TYPE.BILL_LETTER_SMS,
  curBillTypeNm: BILL_GUIDE_TYPE_NAME.BILL_LETTER_SMS,
  component: BILL_GUIDE_TYPE_COMPONENT[BILL_GUIDE_TYPE.BILL_LETTER_SMS],
  selectorLabel: BILL_GUIDE_SELECTOR_LABEL.BILL_LETTER_SMS,
  wireCurBillType: WIRE_BILL_GUIDE_TYPE.BILL_LETTER_SMS
}]);


class MyTBillChange extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const billTypeListRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0025, {});
    Observable.combineLatest(
      billTypeListRequest,
    ).subscribe(([_billTypesList]) => {
      const _curBillGuide = this.getResult(_billTypesList);
      let tmpBillGuideTypes;
      // _svcInfo['svcAttrCd'] = 'S1';
      switch ( svcInfo.svcAttrCd ) {
        case 'M1': // 휴대폰
          tmpBillGuideTypes = cellPhoneBillGuideTypes;
          break;
        case 'S1': // 인터넷
        case 'S2': // IPTV
        case 'S3': // 집전화
          tmpBillGuideTypes = mixedBillGuidetypes;
          break;
        case 'M5': // T Wibro
          tmpBillGuideTypes = defaultBillGuideTypes;
          break;
        default: // 없는 경우가 있음 기본은 휴대폰
          tmpBillGuideTypes = cellPhoneBillGuideTypes;
          break;
      }
      const billGuideTypes = tmpBillGuideTypes.map((billGuideType) => {
        billGuideType['kidsYn'] = _curBillGuide['kidsYn'];
        billGuideType['beforeBillType'] = _curBillGuide['curBillType'];
        return billGuideType;
      });

      this.renderView(res, 'bill/myt.bill.guidechange.change.html', {
        // svcInfo: _svcInfo,
        curBillGuide: _curBillGuide,
        billGuideTypes: billGuideTypes,
        billGuideTypesData: JSON.stringify(billGuideTypes),
        isUpdate: false,
        svcInfo
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

export default MyTBillChange;


