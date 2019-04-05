/**
 * 상품 해지 - TB끼리 온가족 프리
 * FileName: benefit.terminate.all-family-free.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.04.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import {PRODUCT_COMBINE_FAMILY_TYPE, PRODUCT_TYPE_NM} from '../../../../types/string.type';
import { SVC_CD } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class BenefitTerminateAllFamilyFree extends TwViewController {
  constructor() {
    super();
  }

  private _allowedProdIds = ['NH00000084', 'TW20000008'];

  /**
   * @param termInfo
   * @param currentSvcMgmtNum
   * @private
   */
  private _convertTermInfo(termInfo: any, currentSvcMgmtNum: any): any {
    const wirelessMemberList: any = FormatHelper.isEmpty(termInfo.combinationWirelessMemberList) ? [] :
      this._convertWirelessMemberList(termInfo.combinationWirelessMemberList, currentSvcMgmtNum),
      wireMemberList: any = FormatHelper.isEmpty(termInfo.combinationWireMemberList) ? [] :
        this._convertWireMemberList(termInfo.combinationWireMemberList, currentSvcMgmtNum);

    return Object.assign(termInfo, {
      combinationGroup: this._convCombinationGroup(termInfo.combinationGroup),
      combinationList: this._sortCombinationList([...wirelessMemberList, ...wireMemberList])
    });
  }

  /**
   * @param list
   * @private
   */
  private _sortCombinationList(list: any): any {
    const myLine: any = [],
      leaderLine: any = [],
      otherLine: any = [];

    list.forEach((item) => {
      if (item.isWireless && item.fam.me || !item.isWireless && item.isMe) {
        myLine.push(item);
        return true;
      }

      if (item.isWireless && item.fam.leader) {
        leaderLine.push(item);
        return true;
      }

      otherLine.push(item);
    });

    return [...myLine, ...leaderLine, ...otherLine];
  }

  /**
   * @param wireLessMemberList
   * @param currentSvcMgmtNum
   * @private
   */
  private _convertWirelessMemberList(wireLessMemberList: any, currentSvcMgmtNum: any): any {
    return wireLessMemberList.map((item) => {
      return this._convertWirelessInfo(item, currentSvcMgmtNum);
    });
  }

  /**
   * @param wireMemberList
   * @param currentSvcMgmtNum
   * @private
   */
  private _convertWireMemberList(wireMemberList: any, currentSvcMgmtNum: any): any {
    return wireMemberList.map((item) => {
      return this._convertWireInfo(item, currentSvcMgmtNum);
    });
  }

  /**
   * @param wireLessInfo
   * @param currentSvcMgmtNum
   * @private
   */
  private _convertWirelessInfo(wireLessInfo: any, currentSvcMgmtNum: any): any {
    const familyType: any = this._getFamilyType(wireLessInfo, currentSvcMgmtNum);

    return Object.assign(wireLessInfo, {
      isWireless: true,
      svcNum: FormatHelper.conTelFormatWithDash(wireLessInfo.svcNum),
      isFamilyLeaderYn: familyType.leader ? 'Y' : 'N',
      fam: familyType
    });
  }

  /**
   * @param wireLessInfo
   * @param currentSvcMgmtNum
   * @private
   */
  private _getFamilyType(wireLessInfo: any, currentSvcMgmtNum: any): any {
    return {
      leader: wireLessInfo.relClCd === '00',
      parents: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.parents,
      grandparents: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.grandparents,
      grandchildren: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.grandchildren,
      spouse: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.spouse,
      children: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.children,
      brother: wireLessInfo.relClNm === PRODUCT_COMBINE_FAMILY_TYPE.brother,
      me: wireLessInfo.svcMgmtNum === currentSvcMgmtNum
    };
  }

  /**
   * @param wireInfo
   * @param currentSvcMgmtNum
   * @private
   */
  private _convertWireInfo(wireInfo: any, currentSvcMgmtNum: any): any {
    return Object.assign(wireInfo, {
      isWireless: false,
      isMe: wireInfo.svcMgmtNum === currentSvcMgmtNum,
      isFamilyLeaderYn: 'N',
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
      svcMgmtNum = svcInfo && svcInfo.svcMgmtNum ? svcInfo.svcMgmtNum : '',
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

      res.render('terminate/benefit.terminate.all-family-free.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm,
        termInfo: this._convertTermInfo(termInfo.result, svcMgmtNum),
        isRepSvc: svcInfo && svcInfo.repSvcYn === 'Y'
      }));
    });
  }
}

export default BenefitTerminateAllFamilyFree;
