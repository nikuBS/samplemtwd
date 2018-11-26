/**
 * FileName: product.roaming.fi.inquire-auth.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';

export default class ProductRoamingFiInquireAuth extends TwViewController {
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.getReservaions().subscribe(reservations => {

      res.render('roaming/product.roaming.fi.inquire-auth.html', { svcInfo, pageInfo, reservations });
    });
  }

  private getReservaions = () => {
    const date = new Date();
    const rentfrom = date.toISOString().substring(0, 10).replace(/\-/gi, '');
    date.setMonth(date.getMonth() + 6);
    const rentto = date.toISOString().substring(0, 10).replace(/\-/gi, '');

    return this.apiService.request(API_CMD.BFF_10_0067, { page: 1, rentfrom : rentfrom , rentto : rentto }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result;
    });
  }
}