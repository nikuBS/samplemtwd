/**
 * FileName: myt-fare.bill.set.reissue.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.01
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { MYT_FARE_BILL_REISSUE, MYT_FARE_BILL_REISSUE_TYPE } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';

const MYT_FARE_BILL_REQ_REISSUE_MULTI_TYPE = {
  'I': ['05', '02'],      // 무선 Bill Letter+이메일
  'A': ['03', '02'],      // 무선 문자+이메일
  'Q': ['05', '03'],      // 무선 Bill Letter+문자
  'U': ['01', '03'],        // 무선 우편 요금안내서+문자 요금안내서 (전자추가발송)
  'W': ['01', '05'],        // 무선 우편 요금안내서+Bill Letter (전자추가발송)
  'T': ['01', '03', '05'],  // 무선 우편 요금안내서+문자 요금안내서+Bill Letter (전자추가발송)
  'Y': ['01', '02', '05'],  // 무선 우편 요금안내서+이메일 요금안내서+Bill Letter (전자추가발송)
  'X': ['01', '02', '03'],  // 무선 우편 요금안내서+이메일 요금안내서+문자 요금안내서 (전자추가발송)
};

const MYT_FARE_BILL_REQ_REISSUE_MULTI_LOCAL_TYPE = {
  'A': ['10', '02'],      // 유선 문자+이메일
  'K': ['05', '02'],      // 유선 Bill Letter+이메일
};

class MyTFareBillSetReissue extends TwViewController {
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( svcInfo.svcAttrCd.indexOf('S') !== -1 ) {
      this.isLocal = true;
    }
    this.apiService.request(API_CMD.BFF_05_0028, {}).subscribe((reissueData) => {
      const apiError = this.error.apiError([
        reissueData
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo);
      }

      // 화면 데이터 설정
      const data = this.convertData(reissueData, svcInfo, pageInfo);
      res.render('bill/myt-fare.bill.set.reissue.html', { data });
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
  }

  private convertData(response, svcInfo, pageInfo: any): any {
    const data: any = {
      type: '01', // 01:무선, 02:유선, 03:etc
      svcInfo,
      pageInfo
    };
    // 서버에서 받은 데이터 설정
    if ( response.result ) {
      // 2018-07-20 양정규 : 유/무선 둘다 날짜를 반환하기 때문에 공통적으로 세팅해준다.
      data['billIsueTypCd'] = response.result.billIsueTypCd;
      data['billIsueTypNm'] = MYT_FARE_BILL_REISSUE_TYPE[data['billIsueTypCd']];
      data['halfYear'] = this.setLocalHalfYearData(response.result.reissueYMs);
      // 유선인 경우에 재발행 사유 정보가 있어 아래정보로 유,무선 구분한다.
      if ( this.isLocal ) {
        data['reasons'] = this.sortReasons(response);
        data['type'] = '02';
        this.setBillIsueTyps(MYT_FARE_BILL_REQ_REISSUE_MULTI_LOCAL_TYPE, data);
      } else {
        this.setBillIsueTyps(MYT_FARE_BILL_REQ_REISSUE_MULTI_TYPE, data);
      }
    }
    return data;
  }

  private sortReasons(response: any): any {
    if (FormatHelper.isEmpty(response.result.reissueReasons)) {
      return [];
    }
    // 사유 정렬순서
    const idx = {
      '03': 1,
      '02': 2,
      '06': 3,
      '99': 4
    };

    const reasons = response.result.reissueReasons.map((v) => {
      v.idx = idx[v.commCdVal];
      // 06:청구서 부달 은 "요금안내서 부달" 로 변경
      v.commCdValNm = v.commCdVal === '06' ? MYT_FARE_BILL_REISSUE.REASON['06'] : v.commCdValNm;
      return v;
    });

    return FormatHelper.sortObjArrAsc(reasons, 'idx');
  }

  private setBillIsueTyps(def, data) {
    if ( def[data['billIsueTypCd']] ) {
      data['billIsueTyps'] = def[data['billIsueTypCd']];
      data['billIsueTypNms'] = MYT_FARE_BILL_REISSUE_TYPE[data['billIsueTypCd']].split('+');
    }
  }

  private setLocalHalfYearData(array): any {
    const result: any = [];
    const length = array.length;
    // 순차적으로 가장 최근날짜로 정렬되어있음
    for ( let i = 0; i < length; i++ ) {
      const data = {};
      data['type1'] = DateHelper.getShortDateWithFormatAddByUnit(array[i], 1, 'month', 'YYYY년 MM월');
      data['type2'] = DateHelper.getShortDateWithFormat(array[i], 'YYYY.MM.DD', 'YYYYMMDD');
      data['type3'] = array[i];
      result.push(data);
    }

    return result;
  }

  private renderErr(res, err, svcInfo): any {
    return this.error.render(res, {
      title: MYT_FARE_BILL_REISSUE.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo
    });
  }

}

export default MyTFareBillSetReissue;
