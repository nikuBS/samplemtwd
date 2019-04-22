/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청현황 상세(MS_04_01_01_01)
 * @file myt-join.wire.history.detail.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청현황 상세 조회
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

    // 원래는 데이터object를 목록 화면에서 받아 뿌려주기만 했지만
    // 인증해제 이슈로 상세화면에서 다시 조회함

    const atype = req.query.atype;      // api type(신청내역 목록조회에서 넘겨줌)
    const dataKey = req.query.key;      // detail key (신청내역 목록조회에서 넘겨줌)
    const dt = req.query.dt;
    const title = MYT_JOIN_WIRE_HIST_DTL_TIT_MAP[atype];

    let apiCmd: any = null;

    if ( atype === MyTJoinWireHistory._ATYPE_167 ) {   // 신규가입상세내역
      apiCmd = API_CMD.BFF_05_0167;
    } else if ( atype === MyTJoinWireHistory._ATYPE_162 ) {   // 설치장소변경상세
      apiCmd = API_CMD.BFF_05_0162;
    } else if ( atype === MyTJoinWireHistory._ATYPE_168 ) {   // 가입상품변경 상세내역
      apiCmd = API_CMD.BFF_05_0168;
    } else if ( atype === MyTJoinWireHistory._ATYPE_143 ) {   // 유선 약정기간 상세내역
      apiCmd = API_CMD.BFF_05_0143;
    } else if ( atype === MyTJoinWireHistory._ATYPE_153 ) {   // 요금상품변경 상세내역
      apiCmd = API_CMD.BFF_05_0153;
    }

    this.apiService.request(apiCmd, {})
      .subscribe((resp) => {

        const list: any = resp.result;
        let data: any  = null;

        if ( resp.code === API_CODE.CODE_00 && list ) {

          if ( Array.isArray(list) ) {

            for ( let i = list.length; i >= 0; i-- ) {
              if ( !FormatHelper.isEmpty(list[i]) ) {
                // 신청내역 목록과 같은 방식으로 생성된 key로 data를 찾음
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

  /**
   * data 포맷팅(날짜, 날짜시간, 휴대폰번호)
   * @param data
   * @private
   */
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

