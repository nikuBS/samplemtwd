/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { MYT_REISSUE_REQ_CODE, MYT_REISSUE_TYPE } from '../../../../types/string.type';

class MyTBillReissue extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let api = API_CMD.BFF_05_0028;
    if ( svcInfo.svcAttrCd.indexOf('S') !== -1 ) {
      api = API_CMD.BFF_05_0051;
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
    const reissueType = Object.keys(MYT_REISSUE_REQ_CODE);
    reissueType.forEach((val) => {
      if ( (key.trim()).indexOf(MYT_REISSUE_REQ_CODE[val]) !== -1 ) {
        value = val;
      }
    });
    return value;
  }

  private convertData(response, svc): any {
    const data: any = {
      halfYear: this.getHalfYearData(),
      type: '01', // 01:무선, 02:유선, 03:etc
      title: '미조회', // 청구서유형명,
      svcInfo: svc
    };
    // 서버에서 받은 데이터 설정
    if ( response.result ) {
      // 유선인 경우에 재발행 사유 정보가 있어 아래정보로 유,무선 구분한다.
      if ( response.result.reissueReasons ) {
        data['reasons'] = response.result.reissueReasons;
        data['title'] = MYT_REISSUE_TYPE[response.result.billIsueTypCd];
        data['type'] = '02';
        // }
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
      data['type3'] = pre_date.getFullYear() + month_label + '01';

      result.push(data);
    }

    return result;
  }
}

export default MyTBillReissue;
