/**
 * FileName: customer.faq.site.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {CUSTOMER_SITEINFO_TYPE} from '../../../../types/string.old.type';

class CustomerFaqInfoSite extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const paths = req.path.split('/');
    const current = paths[paths.length - 1];

    const serviceId = req.params.serviceId;
    const type = req.query.type;
    let isTypeA: boolean;
    let currentService: any;

    if (current === 'm-customer-center') {
      res.render('faq/customer.faq.info.site.m-center.html', {
        svcInfo: svcInfo
      });
    } else {

      if (!serviceId) {

        res.render('faq/customer.faq.info.site.html', {
          svcInfo: svcInfo,
          siteLink: CUSTOMER_SITEINFO_TYPE,
          serviceId: serviceId,
          type: type
        });
      } else {
        this.apiService.request(API_CMD.BFF_08_0057, {
          svcDvcClCd: 'G'
        }).subscribe((resp) => {

          if (resp.code === API_CODE.CODE_00) {

            for (let i = 0, leng = resp.result.length; i < leng; i++) {
              if (resp.result[i].seqNo.toString() === serviceId) {
                currentService = resp.result[i];
              }
            }

            if (type === '0' && serviceId === '3324') {
              isTypeA = true;
            } else {
              isTypeA = false;
            }
            res.render('faq/customer.faq.info.site.html', {
              svcInfo: svcInfo,
              serviceId: serviceId,
              type: type,
              currentService: currentService,
              isTypeA: isTypeA
            });
          } else {
            this.logger.error(this, resp);
            res.render('error.server-error.html', {
              code: resp.code,
              msg: resp.msg,
              svcInfo: svcInfo
            });
          }
        });
      }
    }
  }

}


export default CustomerFaqInfoSite;
