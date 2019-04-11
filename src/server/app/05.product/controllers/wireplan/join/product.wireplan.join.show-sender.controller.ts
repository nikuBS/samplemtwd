/**
 * 유선 부가서비스 > 가입 (발신번호표시)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductWireplanJoinShowSender extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NP00000091'];

  /**
   * 버튼 데이터 변환
   * @param currentAdditionsInfo - API 응답값
   */
  private _getBtnData(currentAdditionsInfo: any): any {
    if (FormatHelper.isEmpty(currentAdditionsInfo.btnData)) {
      return null;
    }

    return currentAdditionsInfo.btnData;
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
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0164, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '01' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0164, { joinTermCd: '01' }, {}, [prodId])
    ).subscribe(([preCheckInfo, joinTermInfo, currentAdditionsInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('wireplan/join/product.wireplan.join.show-sender.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, true),
        btnData: this._getBtnData(currentAdditionsInfo.result)
      }));
    });
  }
}

export default ProductWireplanJoinShowSender;
