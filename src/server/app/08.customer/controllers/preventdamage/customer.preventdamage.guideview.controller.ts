/**
 * FileName: customer.preventdamage.guideview.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON } from '../../../../types/static.type';
import FormatHelper from '../../../../utils/format.helper';

const categoryData = {
  webtoon: CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON
};

class CustomerPreventdamageGuideviewController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code || '',
      backUrl = '/customer/prevent-damage/guide?category=webtoon';

    if (FormatHelper.isEmpty(code)) {
      res.redirect(backUrl);
    }

    const category = code.split('_')[0];
    if (FormatHelper.isEmpty(categoryData[category][code])) {
      res.redirect(backUrl);
    }

    res.render('preventdamage/customer.preventdamage.guideview.html', {
      svcInfo: svcInfo,
      category: category,
      data: categoryData[category][code]
    });
  }
}

export default CustomerPreventdamageGuideviewController;
