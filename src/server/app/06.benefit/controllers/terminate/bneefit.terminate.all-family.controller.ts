/**
 * 상품 해지 - T끼리 온가족할인 결합상품
 * FileName: benefit.terminate.all-family.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.04.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { SVC_CD } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class BenefitTerminateAllFamily extends TwViewController {
  constructor() {
    super();
  }

  private _allowedProdIds = ['NH00000084', 'TW20000010'];

  /**
   * @param termInfo
   * @private
   */
  private _convertTermInfo(termInfo: any): any {
    return Object.assign(termInfo, {
      combinationGroup: this._convCombinationGroup(termInfo.combinationGroup),
      combinationWirelessMember: FormatHelper.isEmpty(termInfo.combinationWirelessMemberList) ? null :
        this._convertWirelessInfo(termInfo.combinationWirelessMemberList[0]),
      combinationWireMember: FormatHelper.isEmpty(termInfo.combinationWireMemberList) ? null :
        this._convertWireInfo(termInfo.combinationWireMemberList[0])
    });
  }

  /**
   * @param wireLessInfo
   * @private
   */
  private _convertWirelessInfo(wireLessInfo: any): any {
    return Object.assign(wireLessInfo, {
      svcNum: FormatHelper.conTelFormatWithDash(wireLessInfo.svcNum)
    });
  }

  /**
   * @param wireInfo
   * @private
   */
  private _convertWireInfo(wireInfo: any): any {
    return Object.assign(wireInfo, {
      svcCdNm: SVC_CD[wireInfo.svcCd]
    });
  }

  /**
   * @param combinationGroup
   * @private
   */
  private _convCombinationGroup(combinationGroup: any): any {
    return Object.assign(combinationGroup, {
      combStaDt: DateHelper.getShortDateWithFormat(combinationGroup.combStaDt, 'YYYY.M.D.')
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
      this.apiService.request(API_CMD.BFF_10_0114, {}, {}, [prodId])
    ).subscribe(([prodInfo, termInfo]) => {
      const apiError = this.error.apiError([prodInfo, termInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('terminate/benefit.terminate.all-family.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm,
        termInfo: this._convertTermInfo(termInfo.result)
      }));
    });
  }
}

export default BenefitTerminateAllFamily;
