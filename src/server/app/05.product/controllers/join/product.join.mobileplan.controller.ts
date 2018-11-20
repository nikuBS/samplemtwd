/**
 * 상품 가입 - 모바일 요금제
 * FileName: product.join.mobileplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import ProductHelper from '../../helper/product.helper';
import FormatHelper from '../../../../utils/format.helper';

class ProductJoinMobileplan extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.redisService.getData('ProductLedger:' + prodId)
    ).subscribe(([ basicInfo, prodRedisInfo ]) => {
      if (basicInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: basicInfo.code,
          msg: basicInfo.msg
        }));
      }

      if (FormatHelper.isEmpty(prodRedisInfo)) {
        return this.error.render(res, renderCommonInfo);
      }

      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0008, {}, {}, prodId),
        this.apiService.request(API_CMD.BFF_10_0009, {})
      ).subscribe(([joinTermInfo, overPayReqInfo]) => {
        if (joinTermInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg
          }));
        }

        res.render('join/product.join.mobileplan.html', Object.assign(renderCommonInfo, {
          joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
          isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
          prodId: prodId
        }));
      });
    });
  }
}

export default ProductJoinMobileplan;
