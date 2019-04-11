/**
 * 모바일 부가서비스 > 5GX VR 팩 카드보드 & 기어
 * @author anklebreaker
 * @since 2019-04-05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import {API_CMD} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import ProductHelper from '../../../../../utils/product.helper';

/**
 * @class
 */
class ProductMobileplanAddJoin5gxVRpack extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _prodIdList = ['NA00006518', 'NA00006531'];

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
        svcInfo: Object.assign(svcInfo, {svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)}),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {prodExpsTypCd: 'P'}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {joinTermCd: '01'}, {}, [prodId])
    ).subscribe(([preCheckInfo, basicInfo, joinTermInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan-add/join/product.mobileplan-add.join.5gx-vrpack.html', {
        ...renderCommonInfo, prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
      });
    });
  }
}

export default ProductMobileplanAddJoin5gxVRpack;
