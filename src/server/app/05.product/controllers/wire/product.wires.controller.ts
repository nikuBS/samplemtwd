/**
 * FileName: product.wires.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { of } from 'rxjs/observable/of';

export default class ProductWires extends TwViewController {
  private WIRE_CODE = 'F01300';

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getMyWireInfo(svcInfo).subscribe(myWire => {
      const error = {
        code: myWire && myWire.code,
        msg: myWire && myWire.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          svcInfo
        });
      }

      res.render('wire/product.wires.html', { svcInfo, pageInfo, myWire });
    });
  }

  private getMyWireInfo = svcInfo => {
    if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
      return this.apiService.request(API_CMD.BFF_05_0128, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return resp;
        }
        return resp.result;
      });
    }

    return of(undefined);
  }
}
