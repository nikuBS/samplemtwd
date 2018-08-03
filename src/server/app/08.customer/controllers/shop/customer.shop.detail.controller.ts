/**
 * FileName: customer.shop.detail.controller.ts (CI_02_04)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class CustomerShopDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const shopCode = req.query.code;

    this.requestShopDetail(shopCode).subscribe((resp) => {
      this.trimResult(resp.result);
      res.render('./shop/customer.shop.detail.html', {
        svcInfo: svcInfo,
        detail: resp.result
      });
    });
  }

  private requestShopDetail(shopCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0007, { locCode: shopCode });
  }

  private trimResult(result: any): void {
    result.weekdayOpenTime = FormatHelper.insertColonForTime(result.weekdayOpenTime);
    result.weekdayCloseTime = FormatHelper.insertColonForTime(result.weekdayCloseTime);
    result.satOpenTime = FormatHelper.insertColonForTime(result.satOpenTime);
    result.satCloseTime = FormatHelper.insertColonForTime(result.satCloseTime);
    result.holidayOpenTime = FormatHelper.insertColonForTime(result.holidayOpenTime);
    result.holidayCloseTime = FormatHelper.insertColonForTime(result.holidayCloseTime);

    if (!result.custRateAvg.includes('.')) {
      result.custRateAvg = result.custRateAvg + '.0';
    }

    const star = Math.round(parseFloat(result.custRateAvg));
    result.star = 'star' + star;

    // TODO: API response is..... wanker!!!! Need to communicate with backend
    // result.workDirection = result.talkMap.match(/1\..*:(.*)2\./)[1];
    // result.publicDirection = result.talkMap.match(/2\..*:(.*)/)[1];
  }
}

export default CustomerShopDetailController;
