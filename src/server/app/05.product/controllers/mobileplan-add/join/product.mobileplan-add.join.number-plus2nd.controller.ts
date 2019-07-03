/**
 * 모바일 부가서비스 > 넘버플러스2
 * @author 
 * @since 2019-07-04
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import {MOBILEPLAN_ADD_ERROR_MSG, PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import {API_CMD} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {REDIS_KEY} from '../../../../../types/redis.type';

/**
 * @class
 */
class ProductMobileplanAddJoinNumberPlus2nd extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _prodIdList = ['NA00004073'];

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

      const wishNumList = [];

      res.render('mobileplan-add/join/product.mobileplan-add.join.number-plus2nd.html', {
        ...renderCommonInfo, prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        prodRedisInfo: prodRedisInfo.result,
        wishNumList
      });
    });
  }
}

export default ProductMobileplanAddJoinNumberPlus2nd;
