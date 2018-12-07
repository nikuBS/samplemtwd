/**
 * FileName: customer.damage-info.contents.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.30
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_DAMAGEINFO_CONTENTS_TITLE } from '../../../../types/string.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerDamageInfoContents extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedPageNo = ['page001', 'page002', 'page003', 'page004', 'page005', 'page006', 'page007',
    'page008', 'page009', 'page010', 'page011', 'page012', 'page013', 'page014', 'page015', 'page016'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const pageNo = req.params.pageNo,
      renderCommonInfo = {
        pageNo: pageNo,
        svcInfo: svcInfo,
        pageInfo: pageInfo
      };

    if (this._allowedPageNo.indexOf(pageNo) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    res.render('damage-info/contents/customer.damage-info.contents.html', Object.assign(renderCommonInfo, {
      pageTitle: CUSTOMER_DAMAGEINFO_CONTENTS_TITLE[pageNo]
    }));
  }
}

export default CustomerDamageInfoContents;
