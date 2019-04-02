/**
 * 모바일 부가서비스 > 5GX VR 팩 카드보드 & 기어
 * FileName: product.mobileplan-add.join.5gx-vrpack.controller.ts
 * Author: ankle breaker (byunma@sk.com)
 * Date: 2019.04.05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import ProductHelper from '../../../../../utils/product.helper';

class ProductMobileplanAddJoin5gxVRpack extends TwViewController {
  constructor() {
    super();
  }

  private readonly _prodIdList = ['NA00006518', 'NA00006531'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: {...pageInfo, menuId: 'M000410'},
        svcInfo: Object.assign(svcInfo, {svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)}),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
    ).subscribe(([ basicInfo, joinTermInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

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
