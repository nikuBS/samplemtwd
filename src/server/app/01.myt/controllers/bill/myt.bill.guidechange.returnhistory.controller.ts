/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';

class MyTBillReturnHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0039, {}).subscribe((returnData) => {
      const data = {
        recCnt: 0
      };
      if (returnData.code !== 'ZINVN8319') { // 요금반송내역이 없는 경우에 대한 코드 값 'ZINVN8319'
        if ( returnData.result ) {
          // 요금반송내역이 있는 경우
          // TODO: 20개 기준 반송 등록일로 sort 한 다음 화면에 출력해야하나?? API 조회가 된 후 확인 필요!!!
          // TODO: 현재 반송내역 데이터가 없어 있는 경우에 대해 처리가 어렵다 데이터가 확보된 이후 재 확인
          data['recCnt'] = (returnData.result.recCnt > 20) ? 20 : returnData.result.recCnt;
        }
      }
      res.render('bill/myt.bill.guidechange.returnhistory.html', { data });
    });
  }
}

export default MyTBillReturnHistory;
