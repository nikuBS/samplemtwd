/**
 * 상품 가입 - T+B결합상품
 * FileName: benefit.join.tb-combination.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD, API_CODE} from '../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../types/string.type';
import { REDIS_KEY } from '../../../types/redis.type';
import FormatHelper from '../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';

class BenefitJoinTbCombination extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIds = ['TW00000062', 'TW00000063'];

  /**
   * @param prodId
   * @private
   */
  private _getReplacedProdId(prodId: any): any {
    if (['NH00000037', 'NH00000039'].indexOf(prodId) !== -1) {
      return 'TW00000062';
    }

    if (['NH00000040', 'NH00000041'].indexOf(prodId) !== -1) {
      return 'TW00000063';
    }

    return prodId;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = this._getReplacedProdId(req.query.prod_id) || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIds.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0119, {}, {}, [prodId]),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId)
    ]).subscribe(([preCheckInfo, prodInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, prodInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('join/benefit.join.tb-combination.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm
      }));
    });
  }
}

export default BenefitJoinTbCombination;
