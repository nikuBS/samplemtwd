/**
 * 모바일 부가서비스 > 휴대폰결제안심인증
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-12-03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanAddLookupPayment extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param paymentInfo
   * @private
   */
  private _convertPaymentInfo(paymentInfo: any): any {
    if (FormatHelper.isEmpty(paymentInfo.combinationLineList)) {
      return null;
    }

    return Object.assign(paymentInfo.combinationLineList[0], {
      svcNumMask: FormatHelper.conTelFormatWithDash(paymentInfo.combinationLineList[0].svcNumMask)
    });
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
        title: PRODUCT_TYPE_NM.SETTING
      };

    this.apiService.request(API_CMD.BFF_10_0021, {}, {}, [prodId])
      .subscribe((paymentInfo) => {
        if (paymentInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, renderCommonInfo);
        }

        const paymentInfoResult = this._convertPaymentInfo(paymentInfo.result);
        if (FormatHelper.isEmpty(paymentInfoResult)) {
          return this.error.render(res, renderCommonInfo);
        }

        res.render('mobileplan-add/lookup/product.mobileplan-add.lookup.payment.html', Object.assign(renderCommonInfo, {
          paymentInfo: paymentInfoResult
        }));
      });
  }
}

export default ProductMobileplanAddLookupPayment;
