/*
 * @file product.dis-pgm.join.ts
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.10.22
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';

class BenefitTPlusSalesController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || '';
    const data: any = {
      svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
      pageInfo: pageInfo,
      prodId: prodId
    };
    // NA00002079 (2년이상), NA00002082(3년이상), NA00002080(5년이상), NA00002081(10년이상), NA00002246(2년미만)
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0081, {}, {}, [prodId]),
    ).subscribe(([tplusInfo]) => {
      if ( tplusInfo.code === API_CODE.CODE_00 ) {
        data.percent = tplusInfo.result.discountRate;
        data.isJoin = (tplusInfo.result.subscriptionCode === 'Y');
      } else {
        return this.error.render(res, {
          code: tplusInfo.code,
          msg: tplusInfo.msg,
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }
      res.render('program/benefit.t-plus-sales.html', { data });
    });
  }
}

export default BenefitTPlusSalesController;

