/**
 * 모바일 부가서비스 > 5GX 워치tab할인_모
 * @file product.mobileplan-add.join.5gx-watchtab.controller.ts
 * @author ankle breaker (byunma@sk.com)
 * @since 2019.04.05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import {MOBILEPLAN_ADD_ERROR_MSG, PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import {API_CMD} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {REDIS_KEY} from '../../../../../types/redis.type';

class ProductMobileplanAddJoin5gxWatchTab extends TwViewController {
  constructor() {
    super();
  }

  private readonly _prodIdList = ['NA00006484'];
  private readonly _mobileplanIdList = ['NA00006404', 'NA00006405'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: {...pageInfo},
        svcInfo: Object.assign(svcInfo, {svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)}),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }
    if (this._mobileplanIdList.indexOf(svcInfo.prodId) === -1) {
      return this.error.render(res, {...renderCommonInfo, msg: MOBILEPLAN_ADD_ERROR_MSG.WATCHTAB.NON_USER});
    }

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {prodExpsTypCd: 'P'}, {}, [prodId]),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId)
    ]).subscribe(([preCheckInfo, basicInfo, prodRedisInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo, prodRedisInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('mobileplan-add/join/product.mobileplan-add.join.5gx-watchtab.html', {
        ...renderCommonInfo, prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        prodRedisInfo: prodRedisInfo.result
      });
    });
  }
}

export default ProductMobileplanAddJoin5gxWatchTab;
