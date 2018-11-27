/**
 * FileName: customer.damage-info.guide.latest.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { CUSTOMER_PROTECT_GUIDE } from '../../../../types/string.type';
import { CUSTOMER_PROTECT_GUIDE_LATEST } from '../../../../types/outlink.type';

class CustomerDamagenfoGuideLatest extends TwViewController {
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
    const listMaxSize = 30;

    res.render('damage-info/customer.damage-info.guide.html', {
      category: 'latest',
      categoryLabel: CUSTOMER_PROTECT_GUIDE.LATEST,
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      list: this._convertList(CUSTOMER_PROTECT_GUIDE_LATEST, 30),
      listMaxSize: listMaxSize
    });
  }
}

export default CustomerDamagenfoGuideLatest;
