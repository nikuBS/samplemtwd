/**
 * FileName: product.roaming.fi.inquire.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.07
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiInquire extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_10_0067, { page: 1, rentfrom : 20180322 , rentto : 20181107 }).subscribe((resp) => {

      const getTFiData = resp;
      // console.log('response : ' , JSON.stringify(resp));
      res.render('roaming/product.roaming.fi.inquire.html', {
        getTFiData: getTFiData,
        svcInfo: svcInfo
      });
    });
  }
}
