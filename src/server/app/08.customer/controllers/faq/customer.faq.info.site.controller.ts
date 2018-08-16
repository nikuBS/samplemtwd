/**
 * FileName: customer.faq.site.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class CustomerFaqInfoSite extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const paths = req.path.split('/');
    const current = paths[paths.length - 1];

    let viewHTML;

    if (current === 'm-customer-center') {
      viewHTML = 'faq/customer.faq.info.site.m-center.html';
    } else {
      viewHTML = 'faq/customer.faq.info.site.html';
    // this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
    //
    //   if (resp.code === API_CODE.CODE_00) {

    }

    res.render(viewHTML, {
      svcInfo: svcInfo
    });
    // }
    // });
  }

}


export default CustomerFaqInfoSite;
