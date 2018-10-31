/**
 * FileName: customer.protect.guide.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PROTECT_GUIDE_VIDEO, CUSTOMER_PROTECT_GUIDE_LATEST } from '../../../../types/outlink.type';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';

const guideCategory = {
  video: {
    LABEL: CUSTOMER_PROTECT_GUIDE.VIDEO,
    LIST: CUSTOMER_PROTECT_GUIDE_VIDEO
  },
  webtoon: {
    LABEL: CUSTOMER_PROTECT_GUIDE.WEBTOON,
    LIST: CUSTOMER_PROTECT_GUIDE_WEBTOON.reverse()
  },
  latest: {
    LABEL: CUSTOMER_PROTECT_GUIDE.LATEST,
    LIST: CUSTOMER_PROTECT_GUIDE_LATEST
  }
};

class CustomerProtectGuide extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertList(guideList, listMaxSize): any {
    return guideList.map((item, i) => {
      return Object.assign(item, {
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const category = req.params.category || 'video',
      listMaxSize = category === 'webtoon' ? 20 : 30;

    if (['video', 'webtoon', 'latest'].indexOf(category) === -1) {
      return res.redirect('/customer/protect/guide');
    }

    res.render('protect/customer.protect.guide.html', {
      category: category,
      categoryLabel: guideCategory[category].LABEL,
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      list: this._convertList(guideCategory[category].LIST, listMaxSize),
      listMaxSize: listMaxSize
    });
  }
}

export default CustomerProtectGuide;
