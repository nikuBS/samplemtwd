/**
 * FileName: customer.preventdamage.guide.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PREVENTDAMAGE_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO, CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST } from '../../../../types/outlink.type';

const categoryLabel = {
  video: CUSTOMER_PREVENTDAMAGE_GUIDE.VIDEO,
  webtoon: CUSTOMER_PREVENTDAMAGE_GUIDE.WEBTOON,
  latest: CUSTOMER_PREVENTDAMAGE_GUIDE.LATEST
};

const outlink = {
  video: CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO,
  latest: CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST
};

class CustomerPreventdamageGuideController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'video';

    res.render('preventdamage/customer.preventdamage.guide.html', {
      category: category,
      categoryLabel: categoryLabel[category],
      svcInfo: svcInfo,
      list: (category === 'video' || category === 'latest') ? outlink[category] : []
    });
  }
}

export default CustomerPreventdamageGuideController;
