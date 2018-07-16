/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class MyTBillReturnHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0039, {}).subscribe((returnData) => {
      const data: any = {
        recCnt: 0,
        records: []
      };
      if ( returnData.code !== 'ZINVN8319' ) { // 요금반송내역이 없는 경우에 대한 코드 값 'ZINVN8319'
        if ( returnData.result && returnData.result.billReturnList ) {
          // 요금반송내역이 있는 경우
          // TODO: 20개 기준 반송 등록일로 sort 한 다음 화면에 출력해야하나?? API 조회가 된 후 확인 필요!!!
          // TODO: 현재 반송내역 데이터가 없어 있는 경우에 대해 처리가 어렵다 데이터가 확보된 이후 재 확인
          const resData = returnData.result.billReturnList;
          const totalCnt = parseInt(resData.tot_cnt, 10);
          data['totCnt'] = (totalCnt > 20) ? 20 : totalCnt;
          for ( let i = 0; i < totalCnt; i++ ) {
            data['records'].push({
              type: resData.record[i].bill_typ, // 안내서 유형
              name: resData.record[i].cust_nm, // 청구인
              sendDt: DateHelper.getShortDateNoDot(resData.record[i].snd_dt), // 발송일
              invDt: DateHelper.getShortDateNoDot(resData.record[i].inv_dt), // 청구일
              returnDt:  DateHelper.getShortDateNoDot(resData.record[i].undlv_rgst_dt), // 반송등록일
              reason: resData.record[i].undlv_rsn // 반송사
            });
          }
        }
      }
      res.render('bill/myt.bill.guidechange.returnhistory.html', { data });
    });
  }
}

export default MyTBillReturnHistory;
