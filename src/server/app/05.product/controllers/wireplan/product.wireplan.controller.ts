/**
 * @file product.wire.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

export default class ProductWire extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getMyWireInfo(svcInfo).subscribe(myWire => {
      if (myWire && myWire.code) {
        return this.error.render(res, {
          ...myWire,
          pageInfo,
          svcInfo
        });
      }

      res.render('wireplan/product.wireplan.html', { svcInfo, pageInfo, myWire });
    });
  }

  private getMyWireInfo = svcInfo => {
    if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
      return this.apiService.request(API_CMD.BFF_05_0179, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return resp;
        }
        return {
          prodNm: svcInfo.prodNm,
          count: Number(resp.result.additionCount)
        };
      });
    }

    return of(undefined);
  }
}
