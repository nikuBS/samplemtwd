/**
 * FileName: customer.preventdamage.guide.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PREVENTDAMAGE_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO, CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST } from '../../../../types/outlink.type';
import { CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON } from '../../../../types/static.type';

const categorySwithingData = {
  video: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.VIDEO,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_VIDEO
  },
  webtoon: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.WEBTOON,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_WEBTOON
  },
  latest: {
    LABEL: CUSTOMER_PREVENTDAMAGE_GUIDE.LATEST,
    LIST: CUSTOMER_PREVENTDAMAGE_GUIDE_LATEST
  }
};

class CustomerPreventdamageGuideController extends TwViewController {
  constructor() {
    super();
  }

  private _convertWebtoonList = (webtoonList: any) => {
    return Object.keys(webtoonList).reverse().map(key => {
      return Object.assign({}, webtoonList[key], {
        CODE: key
      });
    });
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'video';

    res.render('preventdamage/customer.preventdamage.guide.html', {
      category: category,
      categoryLabel: categorySwithingData[category].LABEL,
      svcInfo: svcInfo,
      list: category !== 'webtoon' ? categorySwithingData[category].LIST : this._convertWebtoonList(categorySwithingData[category].LIST)
    });
  }
}

export default CustomerPreventdamageGuideController;
