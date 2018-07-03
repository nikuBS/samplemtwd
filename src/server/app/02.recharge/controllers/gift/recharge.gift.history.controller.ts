/**
 * FileName: recharge.gift.history.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.06.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class RechargeGiftHistory extends TwViewController {
  data: any;

  constructor() {
    super();
  }

  public getMobileLineList() {
    return this.apiService.request(API_CMD.BFF_03_0003, {svcCtg: 'M'});
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const dateSpectrum = [
      DateHelper.getShortDateWithFormatAddByUnit(new Date(), -1, 'months', 'YYYYMMDD'),
      DateHelper.getShortDateWithFormatAddByUnit(new Date(), -3, 'months', 'YYYYMMDD'),
      DateHelper.getShortDateWithFormatAddByUnit(new Date(), -6, 'months', 'YYYYMMDD'),
      DateHelper.getShortDateWithFormatAddByUnit(new Date(), -12, 'months', 'YYYYMMDD')
    ];

    this.getMobileLineList()
        .subscribe((response) => {

          res.render('gift/recharge.gift.history.html', {
            lineList: response.result,
            svcInfo: svcInfo,
            dateList: dateSpectrum
          });
        });

  }
}

export default RechargeGiftHistory;