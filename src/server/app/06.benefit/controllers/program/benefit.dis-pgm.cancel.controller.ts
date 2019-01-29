/*
 * FileName: benefit.dis-pgm.cancel.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.12.18
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class BenefitSelectContract extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if ( FormatHelper.isEmpty(prodId) ) {
      return this.error.render(res, {
        svcInfo: svcInfo
      });
    }

    this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '03' }, {}, [prodId])
      .subscribe((joinTermInfo) => {
        if ( joinTermInfo.code !== API_CODE.CODE_00 ) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg,
            isBackCheck: true
          }));
        }

        res.render('program/benefit.dis-pgm.cancel.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
        }));
      });
  }
}

export default BenefitSelectContract;

