/**
 * FileName: customer.faq.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD } from '../../../../types/api-command.type';

export default class CustomerFaqController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const queryString = req.query.search;

    if (FormatHelper.isEmpty(queryString)) {
      res.render('faq/customer.faq.html', {
        svcInfo: svcInfo
      });
    } else {
      this.apiService.request(API_CMD.BFF_08_0050, {
        srchKey: encodeURIComponent(queryString),
        page: 0,
        size: 20
      }).subscribe((resp) => {
        // TODO: check api and show reulst
        res.render('faq/customer.faq-no-result.html', {
          svcInfo: svcInfo,
          queryString: queryString
        });
      });
    }
  }
}
