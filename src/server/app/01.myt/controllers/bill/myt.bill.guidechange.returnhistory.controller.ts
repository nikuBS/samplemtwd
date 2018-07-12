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
    // home.main.sprint3 참조
    this.apiService.request(API_CMD.BFF_05_0039, {}).subscribe((returnData) => {
      // 서버API 데이터 확인필요!
      const data = {
        recCnt: 3
      };
      if ( returnData.result ) {
        data['recCnt'] = (returnData.result.recCnt > 20) ? 20 : returnData.result.recCnt;
        // 20개 기준 반송 등록일로 sort 한 다음 화면에 출력해야하나?? API 조회가 된 후 확인 필요!!!
      }
      res.render('bill/myt.bill.guidechange.returnhistory.html', { data });
    });
  }
}

export default MyTBillReturnHistory;
