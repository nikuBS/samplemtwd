/**
 * 모바일 부가서비스 > 가입 공통 (옵션입력 없음)
 * FileName: product.mobileplan-add.join.controller.ts
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

class ProductMobileplanAddJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.JOIN
      };

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId])
    ]).subscribe(([preCheckInfo, basicInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
        .subscribe((joinTermInfo) => {
          if (joinTermInfo.code !== API_CODE.CODE_00) {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              code: joinTermInfo.code,
              msg: joinTermInfo.msg,
              isBackCheck: true
            }));
          }

          res.render('mobileplan-add/join/product.mobileplan-add.join.html', Object.assign(renderCommonInfo, {
            prodId: prodId,
            joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
          }));
        });
    });
  }
}

export default ProductMobileplanAddJoin;
