/**
 * 모바일 요금제 > 가입 공통 (옵션 입력 없음)
 * FileName: product.mobileplan.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';
import {REDIS_PRODUCT_INFO} from '../../../../../types/redis.type';

class ProductMobileplanJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.redisService.getData(REDIS_PRODUCT_INFO + prodId)
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

        res.render('mobileplan/join/product.mobileplan.join.html', Object.assign(renderCommonInfo, {
          joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
          isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
          prodId: prodId
        }));
      });
    });
  }
}

export default ProductMobileplanJoin;
