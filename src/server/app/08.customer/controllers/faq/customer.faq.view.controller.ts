/**
 * FileName: customer.faq.view.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.02.15
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class CustomerFaqView extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    const ifaqId = req.query.faq_Id || null;
    const category = req.query.category || null;

    if (FormatHelper.isEmpty(ifaqId) || FormatHelper.isEmpty(category)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
      });
    }


    this.apiService.request(API_CMD.BFF_08_0073, { ifaqId }, {}, [])
    .subscribe(( faqInfo ) => {
      if ( faqInfo.code !== API_CODE.CODE_00 ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          code: faqInfo.code,
          msg: faqInfo.msg
        });
      }

      res.render('faq/customer.faq.view.html', {
        svcInfo : svcInfo,
        faqInfo : faqInfo.result,
        category : category,
        pageInfo : pageInfo
      });
    });
  }
}

export default CustomerFaqView;
