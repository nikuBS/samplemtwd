import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class RechargeCookiz extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const myProductRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0041, {});
    const cookizRequest: Observable<any> = this.apiService.request(API_CMD.BFF_06_0028, {});
    const refillRequest: Observable<any> = this.apiService.request(API_CMD.BFF_06_0001, {});
    let isRefillCoupon = false;

    Observable.combineLatest(
      myProductRequest,
      cookizRequest,
      refillRequest
    ).subscribe(([myProductInfo, cookizInfo, refillCoupon]) => {
      if ( refillCoupon.code === API_CODE.CODE_00 ) {
        isRefillCoupon = refillCoupon.result.length !== 0 ? true : false;
      }

      if ( cookizInfo.code !== '00' ) {
        res.render('cookiz/recharge.cookiz.blocked.html', { svcInfo: svcInfo });
      } else {
        res.render('cookiz/recharge.cookiz.html', {
          svcInfo: svcInfo,
          myProductInfo: myProductInfo.result,
          cookizInfo: cookizInfo.result,
          isRefillCoupon: isRefillCoupon
        });
      }
    });
  }
}

export default RechargeCookiz;
