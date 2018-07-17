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
    // TODO:선택사용회선조회 ( 이전화면에서 회선 변경에 따른 값이 설정된 다면 제거 )
    this.apiService.request(API_CMD.BFF_01_0005, {}).subscribe((info) => {
      svcInfo = this.clone({
        target: svcInfo,
        obj: info.result
      });
      this.apiService.request(API_CMD.BFF_05_0039, {}).subscribe((returnData) => {
        const data: any = {
          totCnt: 0,
          records: [],
          svcInfo: svcInfo
        };
        if ( returnData.code !== 'ZINVN8319' ) { // 요금반송내역이 없는 경우에 대한 코드 값 'ZINVN8319'
          if ( returnData.result && returnData.result.billReturnList ) {
            // 요금반송내역이 있는 경우
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
}

export default MyTBillReturnHistory;
