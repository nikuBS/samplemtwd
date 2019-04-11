/**
 * 상품 해지 - T+B결합상품
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-23
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

/**
 * @class
 */
class BenefitTerminateTbCombination extends TwViewController {
  constructor() {
    super();
  }

  /* 접근 허용 상품코드 */
  private _allowedProdIds = ['NH00000037', 'NH00000039', 'NH00000040', 'NH00000041', 'TW00000062', 'TW00000063'];

  /**
   * 해지 정보확인 데이터 컨버팅
   * @param termInfo - 해지 정보확인 API 응답값
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
   * 무선 결합정보 변환
   * @param wireLessInfo - 무선 결합정보
   */
  private _convertWirelessInfo(wireLessInfo: any): any {
    return Object.assign(wireLessInfo, {
      svcNum: FormatHelper.conTelFormatWithDash(wireLessInfo.svcNum)
    });
  }

  /**
   * 유선 결합정보 변환
   * @param wireInfo - 유선 결합정보
   */
  private _convertWireInfo(wireInfo: any): any {
    return Object.assign(wireInfo, {
      svcCdNm: SVC_CD[wireInfo.svcCd]
    });
  }

  /**
   * 결합 정보 변환
   * @param combinationGroup - 결합 정보
   */
  private _convCombinationGroup(combinationGroup: any): any {
    return Object.assign(combinationGroup, {
      combStaDt: DateHelper.getShortDateWithFormat(combinationGroup.combStaDt, 'YYYY.M.D.')
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
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIds.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0113, {}, {}, [prodId]),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this.apiService.request(API_CMD.BFF_10_0114, {}, {}, [prodId])
    ).subscribe(([preCheckInfo, prodInfo, termInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, prodInfo, termInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('terminate/benefit.terminate.tb-combination.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm,
        termInfo: this._convertTermInfo(termInfo.result)
      }));
    });
  }
}

export default BenefitTerminateTbCombination;
