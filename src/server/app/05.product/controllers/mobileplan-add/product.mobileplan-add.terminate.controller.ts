/**
 * 상품 해지 - 모바일 부가상품
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

/**
 * @class
 */
class ProductMobileplanAddTerminate extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0151, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '03' }, {}, [prodId])
    ]).subscribe(([preCheckInfo, joinTermInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan-add/product.mobileplan-add.terminate.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
      }));
    });
  }
}

export default ProductMobileplanAddTerminate;
