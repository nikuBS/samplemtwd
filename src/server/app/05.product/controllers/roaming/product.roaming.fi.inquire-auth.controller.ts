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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.apiService.request(API_CMD.BFF_10_0060, {keyword : ''}).subscribe((resp) => {
      let countryCode = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        countryCode = resp.result;
      } else {
        countryCode = resp;
      }

      res.render('roaming/product.roaming.fi.inquire-auth.html', {
        countryCode: countryCode,
        svcInfo: svcInfo
      });
    });
  }
}
