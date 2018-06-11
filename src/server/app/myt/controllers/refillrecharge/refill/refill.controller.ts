import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import DateHelper from '../../../../../utils/date.helper';
import FormatHelper from '../../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';

class MyTRefill extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getCouponData()
    ).subscribe(([couponData]) => {
      const data = {
        couponData
      };
      res.render('refillrecharge/refill/refill.html', data);
    });
  }

  private getCouponData(): Observable<any> {
    let couponData = {};
    return this.apiService.request(API_CMD.BFF_05_0002, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        couponData = this.parseData(resp.result.refillCoupon);
      }
      return couponData;
    });
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
}

export default MyTRefill;
