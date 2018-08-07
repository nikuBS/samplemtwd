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
  webtoon: CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON,
  latest: []  // TODO 최신 이용자 피해예방 정보 추가시 사용
};

class CustomerPreventdamageGuideviewController extends TwViewController {
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
    const category = req.query.category || '',
      idx = req.query.idx || '',
      backUrl = '/customer/prevent-damage/guide' + (FormatHelper.isEmpty(category) ? '' : '?category=' + category);

    if (!this._isValid(category, idx)) {
      return res.redirect(backUrl);
    }

    res.render('preventdamage/customer.preventdamage.guideview.html', {
      svcInfo: svcInfo,
      category: category,
      data: categoryData[category][idx]
    });
  }
}

export default CustomerPreventdamageGuideviewController;
