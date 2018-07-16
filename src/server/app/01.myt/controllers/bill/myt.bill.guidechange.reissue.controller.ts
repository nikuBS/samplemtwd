/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { MYT_REISSUE_TYPE } from '../../../../types/string.type';

class MyTBillReissue extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0028, {}).subscribe((reissueData) => {
      // 화면 데이터 설정
      const data = this.convertData(reissueData);
      res.render('bill/myt.bill.guidechange.reissue.html', { data });
    });
  }

  private findMyReissueType(key): string {
    let value = '';
    const reissueType = Object.keys(MYT_REISSUE_TYPE);
    reissueType.forEach((val) => {
      if ( (key.trim()).indexOf(MYT_REISSUE_TYPE[val]) !== -1) {
        value = val;
      }
    });
    return value;
  }

  private convertData(params): any {
    const data: any = {
      halfYear: this.getHalfYearData(),
      type: '01', // 01:무선, 02:유선, 03:etc
      // 우편(1)
      // 이메일청구서(2)
      // 문자+이메일청구서(A)
      // 문자(B)
      // Bill letter (H)
      // Bill letter +이메일청구서(I)
      // Twold확인(P)
      // Bill letter +문자청구서(Q)
      title: 'Bill letter+이메일', // 청구서유형명
      reasonCd: '01', // 01:무선 02:유선(요금조정), 06: 유선(요금안내서 부달) 99: 유선 (기타) '':반송처리(추가예정)
      // svcMgmtNum: '7100000001' // 회선정보

    };
    // 서버에서 받은 데이터 설정
    if ( params.result ) {
      // 청구서명
      data['title'] = params.result.curBillTypeNm;
    }

    // 요금서 종류가 두개 이상인 경우
    // BillCd: 02:이메일, 10:문자, 05:Bill Letter  99:기타 청구서유형코드(임시)
    if ( data['title'].indexOf('+') !== -1 ) {
      data['multi'] = data['title'].split('+');
      data['billCd'] = [ this.findMyReissueType(data['multi'][0]), this.findMyReissueType(data['multi'][1]) ];
    } else {
      data['billCd'] = [ this.findMyReissueType(data['title']) ];
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
