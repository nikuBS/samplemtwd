/**
 * @file [나의요금-환불처리-리스트] 관련 처리
 * @author Lee Kirim
 * @since 2018-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import {MYT_PAYMENT_HISTORY_REFUND_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';


/**
 * 환불처리 리스트데이터 구현
 */
class MyTFareInfoOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(_req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resp) => {
      
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }        

      resp.result.refundPaymentRecord = resp.result.refundPaymentRecord.reduce((prev, cur, index) => {
        
        cur.listId = index; // 상세내역보기에서 참고됨(상세보기와 같은 api 호출)
        cur.reqDt = DateHelper.getShortDate(cur.effStaDt); // 계좌등록일자 (신청일자)
        cur.dataDt = cur.rfndReqDt ? DateHelper.getShortDate(cur.rfndReqDt) : ''; // 처리날짜
        cur.listDt = cur.dataDt.slice(4); // 월일 MMDD
        cur.dataAmt = FormatHelper.addComma(cur.sumAmt); // 합계
        cur.dataOverAmt = FormatHelper.addComma(cur.ovrPay); // 과납금액
        cur.dataBondAmt = FormatHelper.addComma(cur.rfndObjAmt); // 채권보전료
        cur.sortDt = cur.effStaDt; // 변형하지 않은 등록일자 
        cur.dataStatus = MYT_PAYMENT_HISTORY_REFUND_TYPE[cur.rfndStat]; // 처리상태 코드분류에 따른 문구

        // 년도 변경시 년도 표기할 수 있도록 yearHeader속성을 추가 
        if (prev.length) {
          if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
            cur.yearHeader = cur.sortDt.slice(0, 4);
          }
        }

        prev.push(cur);

        return prev;
      }, []);

      res.render('info/myt-fare.info.overpay-refund.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
          data: resp.result.refundPaymentRecord
      }});
    });
  }

}

export default MyTFareInfoOverpayRefund;
