/**
 * FileName: customer.damage-info.guide.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';
import {CUSTOMER_PROTECT_GUIDE_LATEST, CUSTOMER_PROTECT_GUIDE_VIDEO} from '../../../../types/outlink.type';

class CustomerDamagenfoGuide extends TwViewController {
  constructor() {
    super();
  }

  private _allowedCategoryList = ['video', 'latest', 'webtoon'];
  private _categoryLists = {
    video: CUSTOMER_PROTECT_GUIDE_VIDEO,
    latest: CUSTOMER_PROTECT_GUIDE_LATEST,
    webtoon: CUSTOMER_PROTECT_GUIDE_WEBTOON
  };

  /**
   * @param category
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertList(category, guideList, listMaxSize): any {
    if (category === 'webtoon') {
      return this._convertWebtoonList(guideList, listMaxSize);
    }

    return guideList.map((item, i) => {
      return Object.assign(item, {
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  /**
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertWebtoonList(guideList, listMaxSize): any {
    const deepCopyList: any = JSON.parse(JSON.stringify(guideList)).reverse();

    return deepCopyList.map((item, i) => {
      return Object.assign(item, {
        idx: (deepCopyList.length - 1) - i,
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const category = req.query.category || 'video',
      listMaxSize = 20,
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: CUSTOMER_PROTECT_GUIDE[category.toUpperCase()]
      };

    if (this._allowedCategoryList.indexOf(category) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    res.render('damage-info/customer.damage-info.guide.html', Object.assign(renderCommonInfo, {
      category: category,
      categoryLabel: CUSTOMER_PROTECT_GUIDE[category.toUpperCase()],
      list: this._convertList(category, this._categoryLists[category], listMaxSize),
      listMaxSize: listMaxSize
    }));
  }
}

export default CustomerDamagenfoGuide;
