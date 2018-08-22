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

    const serviceId = req.params.serviceId;
    const siteLink = [1, 2, 3, 4, 5, 6, 7];

    if (current === 'm-customer-center') {
      res.render('faq/customer.faq.info.site.m-center.html', {
        svcInfo: svcInfo
      });
    } else {

      if (!serviceId) {

        res.render('faq/customer.faq.info.site.html', {
          svcInfo: svcInfo,
          siteLink: siteLink
        });
      } else {
        this.apiService.request(API_CMD.BFF_08_0057, {

        }).subscribe((resp) => {
          // if (resp.code === API_CODE.CODE_00) {


          // } else {
          //   this.logger.error(this, resp);
          //   res.render('error.server-error.html', {
          //     code: resp.code,
          //     msg: resp.msg,
          //     svcInfo: svcInfo
          //   });
          // }
        });
      }
      // this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
      //
      //   if (resp.code === API_CODE.CODE_00) {

    }
    // }
    // });
  }

}


export default CustomerFaqInfoSite;
