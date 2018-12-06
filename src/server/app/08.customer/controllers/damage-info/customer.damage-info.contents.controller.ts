/**
 * FileName: customer.damage-info.contents.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.30
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {CUSTOMER_DAMAGEINFO_CONTENTS_TITLE} from '../../../../types/string.type';

class CustomerDamageInfoContents extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedPageNo = ['page001', 'page002', 'page003', 'page004', 'page005', 'page006', 'page007',
    'page008', 'page009', 'page010', 'page011', 'page012', 'page013', 'page014', 'page015', 'page016'];

  private readonly _pageNoMenuId = {
    page001: 'M000753',
    page002: 'M000754',
    page003: 'M000755',
    page004: 'M000756',
    page005: 'M000757',
    page006: 'M000758',
    page007: 'M000736',
    page008: 'M000737',
    page009: 'M000738',
    page010: 'M000739',
    page011: 'M000740',
    page012: 'M000743',
    page013: 'M000744',
    page014: 'M000745',
    page015: 'M000746',
    page016: 'M000747'
  };

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
      pageTitle: CUSTOMER_DAMAGEINFO_CONTENTS_TITLE[pageNo],
      menuId: this._pageNoMenuId[pageNo]
    }));
  }
}

export default CustomerDamageInfoContents;
