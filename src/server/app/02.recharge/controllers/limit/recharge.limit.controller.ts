/**
 * FileName: recharge.limit.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.11
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

export interface ILimitData {
  blockYn: string; // '충전서비스 차단여부'
  currentTopUpLimit: string; // '충전가능금액'
  regularTopUpYn: string; // '자동충전여부'
  regularTopUpAmt: string; // '자동충전금액'
  dataLimitedTmthYn: string; // '당월데이터차단여부'
  dataLimitedYn: string; // '매월데이터차단여부'
}

interface IFeeData {
  prodId: string;  // '상품코드'
  prodName: string;  // '상품명'
}

class RechargeLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(this.getFeeData(), this.getLimitData()).subscribe(([feeData, limitData]) => {
      res.render('limit/recharge.limit.html', { svcInfo, limitData, feeData });
    });
  }

  private getFeeData(): Observable<IFeeData> {
    return this.apiService.request(API_CMD.BFF_05_0041, {}).map((resp: { code: string, result: IFeeData }) => {
      return resp.result;
    });
  }

  private getLimitData(): Observable<ILimitData> {
    return this.apiService.request(API_CMD.BFF_06_0034, {}).map((resp: { code: string, result: ILimitData }) => {
      return {
        ...resp.result,
        currentTopUpLimit: FormatHelper.addComma(resp.result.currentTopUpLimit),
        regularTopUpAmt: FormatHelper.addComma(resp.result.regularTopUpAmt),
      };
    });
  }
}

export default RechargeLimit;
