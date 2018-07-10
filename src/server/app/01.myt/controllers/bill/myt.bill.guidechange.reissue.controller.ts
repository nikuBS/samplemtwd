/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MyTBillReissue extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // home.main.sprint3 참조
    Observable.combineLatest(
      this.getReissueData()
    ).subscribe(([reissueData]) => {
      const data = {};
      if ( reissueData.result ) {
        data['type'] = reissueData.result.billIsueTypCd;
      }
      data['halfYear'] = this.getHalfYearData();

      res.render('bill/myt.bill.guidechange.reissue.html', { data });
    });
  }

  private getReissueData(): Observable<any> {
    // const reissueData = {};
    return this.apiService.request(API_CMD.BFF_05_0028, {}).map((resp) => {
      // 바로 받은 response 값은 확인 후 사용하지 않고 필요한 내용 추출하여 사용 예정
      // return reissueData;
      return resp;
    });
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

      result.push(data);
    }

    return result;
  }
}

export default MyTBillReissue;
