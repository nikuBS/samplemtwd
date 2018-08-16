/**
 * FileName: customer.faq.service.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class CustomerFaqInfoService extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
    //
    //   if (resp.code === API_CODE.CODE_00) {

    res.render('faq/customer.faq.info.service.html', {
      svcInfo: svcInfo
    });
      // }
    // });
  }

}


export default CustomerFaqInfoService;
