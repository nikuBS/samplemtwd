/**
 * 유선 부가서비스 > 가입 공통 (옵션입력 없음)
 * FileName: product.wireplan.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../helper/product.helper';
import FormatHelper from '../../../../../utils/format.helper';
import {REDIS_PRODUCT_INFO} from '../../../../../types/common.type';

class ProductWireplanJoin extends TwViewController {
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
      this.redisService.getData(REDIS_PRODUCT_INFO + prodId)
    ).subscribe(([ basicInfo, prodRedisInfo ]) => {
      if (basicInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: basicInfo.code,
          msg: basicInfo.msg
        }));
      }

      if (FormatHelper.isEmpty(prodRedisInfo)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }

      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '01' }, {}, prodId)
        .subscribe((joinTermInfo) => {
          if (joinTermInfo.code !== API_CODE.CODE_00) {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              code: joinTermInfo.code,
              msg: joinTermInfo.msg
            }));
          }

          res.render('wireplan/join/product.wireplan.join.html', Object.assign(renderCommonInfo, {
            prodId: prodId,
            joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result)
          }));
        });
    });
  }
}

export default ProductWireplanJoin;
