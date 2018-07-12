/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';

class MyTBillReturnHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // home.main.sprint3 참조
    Observable.combineLatest(
      this.getReturnHistoryData()
    ).subscribe(([returnData]) => {
      // 서버API 데이터 확인필요!
      const data = {
        recCnt: 3
      };
      if ( returnData.result ) {
        data['recCnt'] = returnData.result.recCnt;
      }
      res.render('bill/myt.bill.guidechange.returnhistory.html', { data });
    });
  }

  private getReturnHistoryData(): Observable<any> {
    // const reissueData = {};
    return this.apiService.request(API_CMD.BFF_05_0039, {}).map((resp) => {
      // 바로 받은 response 값은 확인 후 사용하지 않고 필요한 내용 추출하여 사용 예정
      // return reissueData;
      return resp;
    });
  }
}

export default MyTBillReturnHistory;
