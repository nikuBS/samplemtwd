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

    const serviceId = req.params.serviceId;

    if (!serviceId) {
      res.render('faq/customer.faq.info.service.html', {
        svcInfo: svcInfo
      });
    } else {
      this.apiService.request(API_CMD.BFF_08_0056, {
        seqNum: serviceId
      }).subscribe((resp) => {

        if (resp.code === API_CODE.CODE_00) {
          res.render('faq/customer.faq.info.service-cases.html', {
            svcInfo: svcInfo,
            serviceId: serviceId
          });
        } else {
          this.logger.error(this, resp);
          res.render('error.server-error.html', {
            title: '',
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
      });
    }

    // this.apiService.request(API_CMD.BFF_07_0072, {}).subscribe((resp) => {
    //
    //   if (resp.code === API_CODE.CODE_00) {


    // }
    // });
  }

}


export default CustomerFaqInfoService;
