import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD} from '../../../../../types/api-command.type';
import DateHelper from '../../../../../utils/date.helper';
import FormatHelper from '../../../../../utils/format.helper';

class MyTRefill extends TwViewController {
  constructor() {
    super();
  }

  private parseData(couponData: any): any {
    if (!FormatHelper.isEmpty(couponData)) {
      couponData.map((data) => {
        data.startDate = DateHelper.getShortDateNoDot(data.usePsblStaDt);
        data.endDate = DateHelper.getShortDateNoDot(data.usePsblEndDt);
      });
    }
    return couponData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0002, {}).subscribe((resp) => { // refill coupon 조회
      const couponData = this.parseData(resp.result.refillCoupon);
      const data = {
        couponData: couponData
      };
      res.render('refillrecharge/refill/refill.html', data);
    });
  }
}

export default MyTRefill;
