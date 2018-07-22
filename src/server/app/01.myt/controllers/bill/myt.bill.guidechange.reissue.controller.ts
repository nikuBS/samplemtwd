/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { MYT_REISSUE_REQ_CODE, MYT_REISSUE_REQ_LOCAL_CODE, MYT_REISSUE_TYPE } from '../../../../types/string.type';
import moment from 'moment';

class MyTBillReissue extends TwViewController {
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
    let api = API_CMD.BFF_05_0028;
    if ( svcInfo.svcAttrCd.indexOf('S') !== -1 ) {
      api = API_CMD.BFF_05_0051;
      this.isLocal = true;
    }
    this.apiService.request(api, {}).subscribe((reissueData) => {
      // 화면 데이터 설정
      const data = this.convertData(reissueData, svcInfo);
      res.render('bill/myt.bill.guidechange.reissue.html', { data });
    });
  }

  public clone(params): any {
    const obj = params.obj;
    const target = params.target;
    if ( obj === null || typeof(obj) !== 'object' ) {
      return obj;
    }
    for ( const attr in obj ) {
      if ( obj.hasOwnProperty(attr) ) {
        target[attr] = obj[attr];
      }
    }
    return target;
  }

  private findMyReissueType(key): string {
    let value = '';
    // 유선, 무선 청구서 유형에 타입 코드가 달라 구분하여 처리
    let reissueType = Object.keys(MYT_REISSUE_REQ_CODE);
    if ( this.isLocal ) {
      reissueType = Object.keys(MYT_REISSUE_REQ_LOCAL_CODE);
    }
    reissueType.forEach((val) => {
      if ( this.isLocal ) {
        if ( (key.trim()).indexOf(MYT_REISSUE_REQ_LOCAL_CODE[val]) !== -1 ) {
          value = val;
        }
      } else {
        if ( (key.trim()).indexOf(MYT_REISSUE_REQ_CODE[val]) !== -1 ) {
          value = val;
        }
      }
    });
    return value;
  }

  private convertData(response, svc): any {
    const data: any = {
      type: '01', // 01:무선, 02:유선, 03:etc
      title: '미조회', // 청구서유형명,
      svcInfo: svc
    };
    // 서버에서 받은 데이터 설정
    if ( response.result ) {
      // 2018-07-20 양정규 : 유/무선 둘다 날짜를 반환하기 때문에 공통적으로 세팅해준다.
      data['halfYear'] = this.setLocalHalfYearData(response.result.reissueYMs);
      // 유선인 경우에 재발행 사유 정보가 있어 아래정보로 유,무선 구분한다.
      if ( this.isLocal ) {
        data['reasons'] = response.result.reissueReasons;
        data['title'] = MYT_REISSUE_TYPE[response.result.billIsueTypCd];
        data['type'] = '02';
      } else {
        // 청구서명
        data['title'] = response.result.curBillTypeNm;
      }
    }

    // 요금서 종류가 두개 이상인 경우
    // BillCd: 02:이메일, 03:문자, 05:Bill Letter  01:기타 청구서유형코드
    if ( data['title'] && data['title'].indexOf('+') !== -1 ) {
      data['multi'] = data['title'].split('+');
      data['billCd'] = [this.findMyReissueType(data['multi'][0]), this.findMyReissueType(data['multi'][1])];
    } else {
      data['billCd'] = [this.findMyReissueType(data['title'])];
    }

    return data;
  }

  private setLocalHalfYearData(array): any {
    const result: any = [];
    const length = array.length;
    // 순차적으로 가장 최근날짜로 정렬되어있음
    for ( let i = 0; i < length; i++ ) {
      const data = {};
      data['type1'] = moment(array[i]).add(1, 'month').format('YYYY년 MM월');
      data['type2'] = moment(array[i]).format('YYYY.MM.DD');
      data['type3'] = array[i];

      result.push(data);
    }

    return result;
  }

  // 무선 조회할때도 날짜를 반환해줘서 현재 메소드 사용안함. (양정규)
  private getHalfYearData(): any {
    // 현재 시간 기준으로 6개월 전 날짜 정보 설정
    const result: any = [];
    const now_date = new Date();
    const pre_date = new Date();
    pre_date.setMonth(now_date.getMonth() - 6);
    for ( let i = 0; i > -6; i-- ) {
      const data = {};
      let month_label = '';
      pre_date.setFullYear(now_date.getFullYear());
      pre_date.setMonth(now_date.getMonth() + i);
      const curYear = pre_date.getFullYear();
      const curMonth = pre_date.getMonth() + 1;
      if ( (pre_date.getMonth() + 1) < 10 ) {
        month_label = `${ '0' + (curMonth) }`;
      } else {
        month_label = `${ curMonth }`;
      }
      const lastDay = new Date(curYear, curMonth, 0).getDate();

      data['type1'] = `${pre_date.getFullYear()}년 ${month_label}월`;
      data['type2'] = `${pre_date.getFullYear()}.${month_label}.${lastDay}`;
      data['type3'] = pre_date.getFullYear() + month_label + lastDay;

      result.push(data);
    }

    return result;
  }
}

export default MyTBillReissue;
