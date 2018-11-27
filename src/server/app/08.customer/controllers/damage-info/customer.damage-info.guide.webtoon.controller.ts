/**
 * FileName: customer.damage-info.guide.webtoon.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';

class CustomerDamagenfoGuideWebtoon extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param guideList
   * @param listMaxSize
   * @private
   */
  private _convertList(guideList, listMaxSize): any {
    const deepCopyList: any = JSON.parse(JSON.stringify(guideList)).reverse();

    return deepCopyList.map((item, i) => {
      return Object.assign(item, {
        idx: (deepCopyList.length - 1) - i,
        itemClass: i >= listMaxSize ? 'none' : ''
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const listMaxSize = 20;

    res.render('damage-info/customer.damage-info.guide.html', {
      category: 'webtoon',
      categoryLabel: CUSTOMER_PROTECT_GUIDE.WEBTOON,
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      list: this._convertList(CUSTOMER_PROTECT_GUIDE_WEBTOON, listMaxSize),
      listMaxSize: listMaxSize
    });
  }
}

export default CustomerDamagenfoGuideWebtoon;
