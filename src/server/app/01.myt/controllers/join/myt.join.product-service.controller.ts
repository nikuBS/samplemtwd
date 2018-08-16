/**
 * FileName: myt.join.product-service.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.13
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from '../../../../../../node_modules/rxjs';
import { SVC_CDNAME } from '../../../../types/bff.type';

class MytJoinProductServiceController extends TwViewController {
  constructor() {
    super();
  }

  private _convertDataFeePlan(data: any): any {
    if (FormatHelper.isEmpty(data)) {
      return {
        tClassProList: []
      };
    }
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const feePlanWirelessApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0136, {}, {});
    const feePlanWireApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0128, {}, {});

    Observable.combineLatest(
      feePlanWireApi,
      feePlanWirelessApi
    ).subscribe(([productServiceList]) => {
      console.log(productServiceList);
      res.render('join/myt.join.product-service.html', {
        svcInfo: svcInfo,
        svcCdName: SVC_CDNAME,
        feePlan: this._convertDataFeePlan([])
      });
    });
  }
}

export default MytJoinProductServiceController;
