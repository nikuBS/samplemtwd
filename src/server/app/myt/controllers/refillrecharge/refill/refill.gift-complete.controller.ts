import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';

class MyTRefillGiftComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getRefillCouponLength()
    ).subscribe((refillCouponLength) => {
      res.render('refillrecharge/refill/refill.gift-complete.html', {
        befrSvcNum: req.query.befrSvcNum,
        refillCouponLength: refillCouponLength[0] || 0
      });
    });
  }

  private getRefillCouponLength(): any {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result && resp.result.length;
      }
    });
  }
}

export default MyTRefillGiftComplete;
