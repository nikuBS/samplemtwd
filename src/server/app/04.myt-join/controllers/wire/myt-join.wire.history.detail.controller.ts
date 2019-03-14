/**
 * FileName: myt-join.wire.history.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import DateHelper from '../../../../utils/date.helper';
import StringHelper from '../../../../utils/string.helper';
import { MYT_JOIN_WIRE, MYT_JOIN_WIRE_HIST_DTL_TIT_MAP } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import MyTJoinWireHistory from './myt-join.wire.history.controller';
import FormatHelper from '../../../../utils/format.helper';


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

    // 인증해제 이슈로 상세화면에서 다시 조회함

    const atype = req.query.atype;
    const dataKey = req.query.key;
    const dt = req.query.dt;
    const title = MYT_JOIN_WIRE_HIST_DTL_TIT_MAP[atype];

    let apiCmd: any = null;

    if ( atype === MyTJoinWireHistory._ATYPE_167 ) {
      apiCmd = API_CMD.BFF_05_0167;
    } else if ( atype === MyTJoinWireHistory._ATYPE_162 ) {
      apiCmd = API_CMD.BFF_05_0162;
    } else if ( atype === MyTJoinWireHistory._ATYPE_168 ) {
      apiCmd = API_CMD.BFF_05_0168;
    } else if ( atype === MyTJoinWireHistory._ATYPE_143 ) {
      apiCmd = API_CMD.BFF_05_0143;
    } else if ( atype === MyTJoinWireHistory._ATYPE_153 ) {
      apiCmd = API_CMD.BFF_05_0153;
    }

    this.apiService.request(apiCmd, {})
      .subscribe((resp) => {

        const list: any = resp.result;
        let data  = null;

        if ( resp.code === API_CODE.CODE_00 && list ) {

          if ( Array.isArray(list) ) {

            for ( let i = list.length; i >= 0; i-- ) {
              if ( !FormatHelper.isEmpty(list[i]) ) {
                if ( dataKey === MyTJoinWireHistory.getDetailKey(list[i], atype)) {
                  data = list[i];
                }
              }
            }

          } else if ( typeof(list) === 'object' && !FormatHelper.isEmpty(list) ) {
            if ( dataKey === MyTJoinWireHistory.getDetailKey(list, atype)) {
              data = list;
            }
          }

          if ( data ) {
            data['atype'] = atype;
            data['dt'] = dt;

            const options = {title: title, svcInfo: svcInfo, pageInfo: pageInfo, data : this._formatData(data) };
            res.render('wire/myt-join.wire.history.detail.html', options);

          } else {
            this.error.render(res, {
              title: MYT_JOIN_WIRE.HISTORY.TITLE,
              code: '',
              msg: 'not found data',
              pageInfo: pageInfo,
              svcInfo: svcInfo
            });
          }
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.HISTORY.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });

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

