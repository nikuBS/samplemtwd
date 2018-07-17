/**
 * FileName: myt.bill.guidechange.update.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.03
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CODE } from '../../../../types/api-command.type';
import { BILL_GUIDE_TYPE, LINE_NAME, WIRE_BILL_GUIDE_TYPE } from '../../../../types/bff-common.type';
import { API_CMD } from '../../../../types/api-command.type';
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

class MyTBillUpdate extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // const selectedSessionsRequest: Observable<any> = this.apiService.request(API_CMD.BFF_01_0005, {});
    const billTypeListRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0025, {});
    Observable.combineLatest(
      // selectedSessionsRequest,
      billTypeListRequest,
    ).subscribe(([_billTypesList]) => {
      // svcInfo = this.getResult(_selectedSessions);
      console.log('~~~~~~~~~svcInfo', svcInfo);
      const _curBillGuide = this.getResult(_billTypesList);
      console.log('~~~~~~~~~svcInfo', _curBillGuide);
      // const isWire = (svcInfo.svcAttrCd === 'S1' || svcInfo.svcAttrCd === 'S2' || svcInfo.svcAttrCd === 'S3') ? true : false;
      // const billGuideTypeDefine = isWire ? WIRE_BILL_GUIDE_TYPE : BILL_GUIDE_TYPE;
      const anotherBillGuideType = (_curBillGuide.curBillType === BILL_GUIDE_TYPE.TWORLD) ? BILL_GUIDE_TYPE.BILL_LETTER : BILL_GUIDE_TYPE.TWORLD;
      _curBillGuide['component'] = BILL_GUIDE_TYPE_COMPONENT[_curBillGuide['curBillType']];
      console.log('~~~~~~~~~`_curBillGuide', _curBillGuide)
      _curBillGuide['wireCurBillType'] = _curBillGuide['curBillType'];
      this.renderView(res, 'bill/myt.bill.guidechange.update.html', {
        curBillGuide: _curBillGuide,
        curBillGuideData: JSON.stringify(_curBillGuide),
        isUpdate: true,
        anotherBillGuideType: anotherBillGuideType,
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

export default MyTBillUpdate;
