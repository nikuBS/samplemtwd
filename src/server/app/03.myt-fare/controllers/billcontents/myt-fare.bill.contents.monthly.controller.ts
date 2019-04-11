/**
 * @file [콘텐츠결제-월별내역]
 * @author Lee kirim
 * @since 2018-11-29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @interface
 * @desc API 호출시 파라미터 정의
 */
interface Query {
  gubun: string; // 한도 조회 구분 Done: 한도조회 결과
  requestCnt: number; // 재시도 횟수 Done의 경우 1, 2
}

/**
 * @interface
 * @desc API 결과값 형태 정의
 */
interface Result {
  [key: string]: string;
}

/**
 * 콘텐츠결제 월별내역 구현
 */
class MyTFareBillContentsMonthly extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      gubun: 'Done',
      requestCnt: 1
    };

    this.apiService.request(API_CMD.BFF_07_0081, query).subscribe((resp) => {
      this.logger.info(this, resp.code !== API_CODE.CODE_00, resp);      
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      const data: Result | any = resp.result;
      if (data) {
        /**
         * 금액 number 값을 쉼표를 붙인 문자형태로 데이터 추가
         */
        data.useAmt = FormatHelper.addComma(data.tmthUseAmt); // 당월 사용금액 
        data.limiitAmt = FormatHelper.addComma(data.useContentsLimitAmt); // 고객이 설정한 이용한도 조회 (월한도) 
        data.remainAmt = FormatHelper.addComma(data.remainUseLimit); // 잔여한도
        data.payAmt = FormatHelper.addComma(data.tmthChrgAmt); // 당월 선결제 금액 
        data.ableAmt = FormatHelper.addComma(data.tmthChrgPsblAmt); // 선결제 가능금액 
      }
      
      res.render('billcontents/myt-fare.bill.contents.monthly.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        data,
        curMonth: DateHelper.getCurrentMonth() // 현재 월
      });

    });

  }

}

export default MyTFareBillContentsMonthly;
