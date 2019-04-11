/**
 * 상품 해지 - T끼리 온가족할인
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PRODUCT_COMBINE_FAMILY_TYPE, PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 */
class BenefitTerminateAllFamily extends TwViewController {
  constructor() {
    super();
  }

  /* 접근 허용 상품코드 */
  private _allowedProdIds = ['NA00002040', 'TW20000010'];

  /**
   * 해지 정보 변환
   * @param termInfo - 해지 정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
   */
  private _convertTermInfo(termInfo: any, currentSvcMgmtNum: any): any {
    return Object.assign(termInfo, {
      combinationGroup: this._convCombinationGroup(termInfo.combinationGroup),
      combinationWirelessMember: FormatHelper.isEmpty(termInfo.combinationWirelessMemberList) ? null :
        this._convertWirelessMemberList(termInfo.combinationWirelessMemberList, currentSvcMgmtNum)
    });
  }

  /**
   * 무선 결합회선 목록 변환
   * @param wireLessMemberList - 무선회선 목록 변환
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
   */
  private _convertWirelessMemberList(wireLessMemberList: any, currentSvcMgmtNum: any): any {
    const wireMemberList: any = wireLessMemberList.map((item) => {
      return this._convertWirelessInfo(item, currentSvcMgmtNum);
    });

    return this._sortCombinationList(wireMemberList);
  }

  /**
   * 결합 목록 정렬
   * @param list - 결합 회선 목록
   */
  private _sortCombinationList(list: any): any {
    const myLine: any = [],
      leaderLine: any = [],
      otherLine: any = [];

    list.forEach((item) => {
      if (item.fam.me) {
        myLine.push(item);
        return true;
      }

      if (item.fam.leader) {
        leaderLine.push(item);
        return true;
      }

      otherLine.push(item);
    });

    return [...myLine, ...leaderLine, ...otherLine];
  }

  /**
   * 무선 결합 정보 변환
   * @param wireLessInfo - 무선 결합 정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
   */
  private _convertWirelessInfo(wireLessInfo: any, currentSvcMgmtNum: any): any {
    const familyType: any = this._getFamilyType(wireLessInfo, currentSvcMgmtNum);

    return Object.assign(wireLessInfo, {
      isRepSvc: currentSvcMgmtNum === wireLessInfo.svcMgmtNum,
      auditDtm: DateHelper.getShortDateWithFormat(wireLessInfo.auditDtm, 'YYYY.M.D.'),
      svcNum: FormatHelper.conTelFormatWithDash(wireLessInfo.svcNum),
      isFamilyLeaderYn: familyType.leader ? 'Y' : 'N',
      fam: familyType
    });
  }

  /**
   * 무선결합회선 관계값 산출
   * @param wireLessInfo - 무선 결합 정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
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

      res.render('terminate/benefit.terminate.all-family.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm,
        termInfo: this._convertTermInfo(termInfo.result, svcMgmtNum),
        isRepSvc: svcInfo && svcInfo.repSvcYn === 'Y'
      }));
    });
  }
}

export default BenefitTerminateAllFamily;
