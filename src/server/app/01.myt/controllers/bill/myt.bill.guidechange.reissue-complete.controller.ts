/**
 * FileName: myt.bill.guidechange.reissue-complete.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {MYT_REISSUE_REQ_CODE, MYT_REISSUE_REQ_LOCAL_CODE, MYT_REISSUE_TYPE} from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';


class MyTBillReissueComplete extends TwViewController {
  private _isLocal: boolean = false;
  set isLocal(val) {
    this._isLocal = val;
  }

  get isLocal() {
    return this._isLocal;
  }
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    if ( svcInfo.svcAttrCd.indexOf('S') !== -1 ) {
      this.isLocal = true;
    }

    // 넘어온 parameter 정보를 확인하여 데이터 확인
    // typeCd -> 01, 02, 03, 04 (Bill Letter, 문자, 이메일, 기타)
    // month -> 20180707
    const data = {
      svcInfo: svcInfo
    };
    if ( req && req.query ) {
      if ( this.isLocal ) {
        data['type'] = MYT_REISSUE_REQ_LOCAL_CODE[req.query.typeCd];
      } else {
        data['type'] = MYT_REISSUE_REQ_CODE[req.query.typeCd];
      }
      data['month1'] = this.regMonth('YM', req.query.month);
      data['month2'] = this.regMonth('YMD', req.query.month);
    }
    this.renderView(res, 'bill/myt.bill.guidechange.reissue-complete.html', { data });
  }

  public renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }

  private regMonth(type: string, date: string): string {
    let result = '';
    switch ( type ) {
      case 'YM':
        result = DateHelper.getShortDateWithFormatAddByUnit(date, 1, 'month', 'YYYY년 MM월');
        break;
      case 'YMD':
        result = date.replace(/^(.{4})(.{2})(.{2}).*$/, '$1.$2.$3');
    }
    return result;
  }

}

export default MyTBillReissueComplete;
