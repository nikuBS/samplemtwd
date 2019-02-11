/**
 * 상품 가입 - T+B결합상품
 * FileName: benefit.join.tb-combination.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import { BENEFIT_TBCOMBINATION_JOIN_STATUS, PRODUCT_TYPE_NM } from '../../../types/string.type';
import { REDIS_KEY } from '../../../types/redis.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';
import DateHelper from '../../../utils/date.helper';

class BenefitJoinTbCombination extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIds = ['TW00000062', 'TW00000063', 'NH00000037', 'NH00000039', 'NH00000040', 'NH00000041'];

  /**
   * @param joinInfo
   * @private
   */
  private _getConvertCombiWireProductList(joinInfo: any): any {
    if (FormatHelper.isEmpty(joinInfo.useLineList) || FormatHelper.isEmpty(joinInfo.useLineList[0].combiWireProductList)) {
      return [];
    }

    return joinInfo.useLineList[0].combiWireProductList.map((item) => {
      return Object.assign(item, {
        combStaDt: DateHelper.getShortDateWithFormat(item.combStaDt, 'YYYY.M.DD.'),
        combStatusText: FormatHelper.isEmpty(item.combYn) ? BENEFIT_TBCOMBINATION_JOIN_STATUS.IS_COMBINED :
          BENEFIT_TBCOMBINATION_JOIN_STATUS.DIS_COMBINED,
        isCombine: FormatHelper.isEmpty(item.combYn)
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIds.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this.apiService.request(API_CMD.BFF_10_0142, { choiceSvcMgmtNum: svcInfo.svcMgmtNum }, {}, [prodId])
    ).subscribe(([prodInfo, joinInfo]) => {
      const apiError = this.error.apiError([prodInfo, joinInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('join/benefit.join.tb-combination.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        currentSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum),
        prodInfo: prodInfo.result,
        combiWireProductList: this._getConvertCombiWireProductList(joinInfo.result)
      }));
    });
  }
}

export default BenefitJoinTbCombination;
