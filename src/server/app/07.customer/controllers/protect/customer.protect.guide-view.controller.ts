/**
 * FileName: customer.protect.guide-view.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';
import FormatHelper from '../../../../utils/format.helper';

const categoryData = {
  webtoon: CUSTOMER_PROTECT_GUIDE_WEBTOON
};

class CustomerProtectGuideView extends TwViewController {
  constructor() {
    super();
  }

  private _isValid(category, idx): any {
    return !FormatHelper.isEmpty(category)
        && !FormatHelper.isEmpty(idx)
        && ['webtoon', 'latest'].indexOf(category) !== -1
        && !FormatHelper.isEmpty(categoryData[category][idx]);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.params.category || '',
      idx = req.params.idx || '',
      backUrl = '/customer/protect/guide' + (FormatHelper.isEmpty(category) ? '' : '/' + category);

    if (!this._isValid(category, idx)) {
      return res.redirect(backUrl);
    }

    res.render('protect/customer.protect.guide-view.html', {
      svcInfo: svcInfo,
      category: category,
      data: categoryData[category][idx]
    });
  }
}

export default CustomerProtectGuideView;
