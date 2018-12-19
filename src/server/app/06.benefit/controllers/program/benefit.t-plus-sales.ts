/*
 * FileName: product.dis-pgm.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class BenefitTPlusSales extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };
    // NA00002079 (2년이상), NA00002082(3년이상), NA00002080(5년이상), NA00002081(10년이상), NA00002246(2년미만)
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0081, {}, {}, prodId),
    ).subscribe(([joinTermInfo, tplusInfo]) => {
      if ( tplusInfo.code === API_CODE.CODE_00 ) {
        data.percent = tplusInfo.result.discountRate;
        data.isJoin = (tplusInfo.result.subscriptionCode === 'Y');
      } else {
        return this.error.render(res, {
          code: tplusInfo.code,
          msg: tplusInfo.msg,
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }

      if ( joinTermInfo.code === API_CODE.CODE_00 ) {
        data.joinInfoTerm = this._convertJoinInfoTerm(joinTermInfo.result);
      } else {
        return this.error.render(res, {
          code: joinTermInfo.code,
          msg: joinTermInfo.msg,
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }
      res.render('program/benefit.t-plus-sales.html', { data });
    });
  }

  _convertJoinInfoTerm(joinTermInfo) {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }
}

export default BenefitTPlusSales;

