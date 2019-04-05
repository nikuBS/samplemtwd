/**
 * FileName: myt-fare.bill.small.monthly.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018. 11. 29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

interface Query {
  gubun: string;
  requestCnt: number;
}
interface Result {
  [key: string]: string;
}
class MyTFareBillSmallMonthly extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      gubun: 'Done',
      requestCnt: 1
    };

    this.apiService.request(API_CMD.BFF_07_0073, query).subscribe((resp) => {
      
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
        data.useAmt = FormatHelper.addComma(data.tmthUseAmt);
        data.limiitAmt = FormatHelper.addComma(data.microPayLimitAmt);
        data.remainAmt = FormatHelper.addComma(data.remainUseLimit);
        data.payAmt = FormatHelper.addComma(data.tmthChrgAmt);
        data.ableAmt = FormatHelper.addComma(data.tmthChrgPsblAmt);
      }
      
      res.render('billsmall/myt-fare.bill.small.monthly.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        data,
        curMonth: DateHelper.getCurrentMonth() // 현재 월
      });

    });

  }

}

export default MyTFareBillSmallMonthly;
