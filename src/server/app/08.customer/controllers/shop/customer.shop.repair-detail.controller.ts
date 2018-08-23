/**
 * FileName: customer.shop.repair-detail.controller.ts (CI_03_03)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.08.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

export default class CustomerShopRepairDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const code = req.query.code;
    this.getShopDetail(code).subscribe(
      (result) => {
        res.render('./shop/customer.shop.repair-detail.html', {
          svcInfo: svcInfo,
          detail: result
        });
      },
      (err) => {
        this.error.render(res, {
          title: 'AS센터 정보',
          code: err.code,
          msg: err.msg,
          svcInfo: svcInfo
        });
      }
    );
  }

  private getShopDetail(code: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0055, { locCode: code })
      .map((res) => {
        if (res.code === API_CODE.CODE_00) {
          return res.result;
        }
      });
  }
}
