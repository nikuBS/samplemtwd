/**
 * 상품 해지 - TB끼리 온가족 프리
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-04-01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PRODUCT_COMBINE_FAMILY_TYPE, PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { SVC_CD } from '../../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class BenefitTerminateAllFamilyFree extends TwViewController {
  constructor() {
    super();
  }

  /* 접근 허용 상품코드 */
  private _allowedProdIds = ['NH00000084', 'TW20000008'];

  /**
   * 해지 정보 변환
   * @param termInfo - 해지 정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
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
   * 결합 목록 정렬
   * @param list - 결합 회선 목록
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
   * 무선 결합회선 목록 변환
   * @param wireLessMemberList - 무선회선 목록 변환
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
   */
  private _convertWirelessMemberList(wireLessMemberList: any, currentSvcMgmtNum: any): any {
    return wireLessMemberList.map((item) => {
      return this._convertWirelessInfo(item, currentSvcMgmtNum);
    });
  }

  /**
   * 유선 결합회선 목록 변환
   * @param wireMemberList - 유선회선 목록 변환
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
   */
  private _convertWireMemberList(wireMemberList: any, currentSvcMgmtNum: any): any {
    return wireMemberList.map((item) => {
      return this._convertWireInfo(item, currentSvcMgmtNum);
    });
  }

  /**
   * 무선 결합정보 변환
   * @param wireLessInfo - 무선회선 정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
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
   * 가족 유형 산출
   * @param wireLessInfo - 무선 결합정보
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
   * 유선 결합정보 변환
   * @param wireInfo - 유선 결합정보
   * @param currentSvcMgmtNum - 현재 회선 서비스관리번호
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

      res.render('terminate/benefit.terminate.all-family-free.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        prodNm: prodInfo.result.summary.prodNm,
        termInfo: this._convertTermInfo(termInfo.result, svcMgmtNum),
        isRepSvc: svcInfo && svcInfo.repSvcYn === 'Y' && svcMgmtNum === termInfo.result.combinationGroup.svcMgmtNum
      }));
    });
  }
}

export default BenefitTerminateAllFamilyFree;
