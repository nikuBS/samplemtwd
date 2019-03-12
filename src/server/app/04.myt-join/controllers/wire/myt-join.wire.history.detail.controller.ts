/**
 * FileName: myt-join.wire.history.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import DateHelper from '../../../../utils/date.helper';
import StringHelper from '../../../../utils/string.helper';
import { MYT_JOIN_WIRE_HIST_DTL_TIT_MAP } from '../../../../types/string.type';


class MyTJoinWireHistoryDetail extends TwViewController {


  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.HISTORY_DETAIL.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    const data = JSON.parse(req.query.data);
    const title = MYT_JOIN_WIRE_HIST_DTL_TIT_MAP[data.atype];
    const options = {title: title, svcInfo: svcInfo, pageInfo: pageInfo, data: this._formatData(data) };
    res.render('wire/myt-join.wire.history.detail.html', options);
  }

  private _formatData(data: any): any {

    this._formatDt(data, 'dt');

    switch ( data.atype ) {

      case '167' :
        if ( data['wireRegistOss'] && data['wireRegistOss']['adjPrefrSvsetDtm'] ) {
          data['svcPrefrDtm'] = DateHelper.getShortDateAndTime(data['wireRegistOss']['adjPrefrSvsetDtm']);
        } else {
          this._formatDt(data, 'svcPrefrDtm');
        }
        if ( data['wireRegistOss'] ) {
          this._formatHp(data['wireRegistOss'], 'happyOperPhonNum');
          this._formatHp(data['wireRegistOss'], 'happyCoordiPhonNum');
        }
        break;

      case '162' :
        this._formatHp(data, 'cntcPrefrPhonNum');
        this._formatHp(data, 'cntcPrefrMblPhonNum');
        this._formatDt(data, 'mvDt');
        this._formatDt(data, 'stopPrefrDt');
        this._formatDt(data, 'setPrefrDt');
        if ( data['ossOut'] ) {
          this._formatDtm(data['ossOut'], 'adjPrefrSvsetDtm');
          this._formatHp(data['ossOut'], 'happyOperPhonNum');
          this._formatHp(data['ossOut'], 'happyCoordiPhonNum');
          this._formatHp(data['ossOut'], 'operCoPhonNum');
        }
        break;
      case '168' :
        this._formatDtm(data, 'svcPrefrDtm');
        if ( data['ossOut'] ) {
          this._formatDtm(data['ossOut'], 'adjPrefrSvsetDtm');
          this._formatHp(data['ossOut'], 'happyOperPhonNum');
          this._formatHp(data['ossOut'], 'happyCoordiPhonNum');
          this._formatHp(data['ossOut'], 'operCoPhonNum');
        }
        break;
      case '143' :
      case '153' :
        this._formatHp(data, 'normalNum');
        this._formatHp(data, 'phoneNum');
        break;
    }
    return data;
  }



  private _formatHp(data: any, key: string): void {
    data[key] = data[key] ? StringHelper.phoneStringToDash( data[key] ) : '';
  }
  private _formatDt(data: any, key: string): void {
    data[key] = data[key] ? DateHelper.getShortDate( data[key] ) : '';
  }
  private _formatDtm(data: any, key: string): void {
    data[key] = data[key] ? DateHelper.getShortDateAndTime( data[key] ) : '';
  }
}

export default MyTJoinWireHistoryDetail;

