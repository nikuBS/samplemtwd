/**
 * FileName: customer.preventdamage.guide.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PREVENTDAMAGE_GUIDE } from '../../../../types/string.old.type';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO, CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST } from '../../../../types/outlink.type';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON } from '../../../../types/static.type';

const categorySwithingData = {
  video: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.VIDEO,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO
  },
  webtoon: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.WEBTOON,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON.reverse()
  },
  latest: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.LATEST,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST
  }
};

class CustomerPreventdamageGuide extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'video';

    if (['video', 'webtoon', 'latest'].indexOf(category) === -1) {
      return res.redirect('/customer/prevent-damage/guide');
    }

    res.render('preventdamage/customer.preventdamage.guide.html', {
      category: category,
      categoryLabel: categorySwithingData[category].LABEL,
      svcInfo: svcInfo,
      list: category !== 'webtoon' ? categorySwithingData[category].LIST : categorySwithingData[category].LIST
    });
  }
}

export default CustomerPreventdamageGuide;
