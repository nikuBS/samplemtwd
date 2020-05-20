/**
 * @file 나의 결합상품 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {COMBINATION_PRODUCT} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {
  MYT_JOIN_PERSONAL,
  MYT_JOIN_FAMILY,
} from '../../../../types/string.type';
import MyTHelper from '../../../../utils/myt.helper';

/**
 * @class
 * @desc 나의 가입 결합상품
 */
export default class MyTJoinMyPlanCombine extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면 랜더링
   * @param req
   * @param res
   * @param _next
   * @param svcInfo
   * @param _allSvc
   * @param _childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    let renderCommonInfo: any = {
      pageInfo,
      svcInfo,
      type: req.query.type,
      prodId: req.params.combination
    };

    /**
     * @desc 공통에러처리
     * @param resp
     */
    const errorRender = (resp?): any => {
      return this.error.render(res, {
        ...renderCommonInfo,
        ...resp
      });
    };

    if (renderCommonInfo.prodId) { // last path에 prodId가 추가되어 있을 경우 결합가족보기(유선상품의 경우 결합상품보기)
      // 하나의 결합상품에 prodId가 여러개 매핑되어 있는 경우도 있고, 여러개의 상품이 하나의 html을 쓰는 경우도 있어 별도의 식별자 추가함
      // const pageId = '';
      const pageId = COMBINATION_PRODUCT[renderCommonInfo.prodId || ''];
      if (!pageId) {  // pageId가 없는 경우 에러 페이지 랜딩
        errorRender();
      }

      renderCommonInfo = {
        ...renderCommonInfo,
        pageId
      };

      this.getCombination(renderCommonInfo).subscribe(combination => {
        if (combination.code) {
          return errorRender(combination);
        }

        res.render('myplancombine/myt-join.myplancombine.combination.html', {
          ...renderCommonInfo,
          combination
        });
      });
    } else {  // 결합상품 목록 페이지로 랜딩
      this._getCombinations().subscribe(combinations => {
        if (combinations.code) {
          return errorRender(combinations);
        }

        res.render('myplancombine/myt-join.myplancombine.html', {
          ...renderCommonInfo,
          combinations
        });
      });
    }
  }

  /**
   * @desc 결합상품 리스트 가져오기
   * @private
   */
  private _getCombinations() {
    return this.apiService.request(API_CMD.BFF_05_0133, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return (resp.result.combinationMemberList || []).map(comb => {
        return {
          ...comb,
          scrbDt: DateHelper.getShortDate(comb.scrbDt)
        };
      });
    });
  }

  /**
   * @desc 결합 가족 가져오기
   * @param renderCommonInfo {
   *   prodId: 결합상품 id
   *   type: TB결합상품에 대해서 BFF에 개인형/패밀리형 구분이 없어서 FE에서 query param로 받음. 1:개인, 2:패밀리, 0: 나머지
   *   svcInfo: 세션 정보
   * }
   */
  private getCombination(renderCommonInfo) {
    return this.apiService.request(API_CMD.BFF_05_0134, {}, {}, [renderCommonInfo.prodId]).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      const BADGE = { // 가족 관계 코드에 따른 뱃지 아이콘 설정
        '00': 'f-delegate',
        '01': 'partner',
        '02': 'children',
        '03': 'parents',
        '04': 'brother',
        '05': 'grandchildren',
        '06': 'grandparents'
      };

      const group = resp.result.combinationGroup;

      return {
        ...resp.result,
        combinationGroup: {
          ...group,
          totUseYy: MyTHelper.getPeriod({yy: group.totUseYy}),
          combProdNm: renderCommonInfo.type && renderCommonInfo.type === '1' ?
            group.combProdNm.replace(MYT_JOIN_FAMILY, MYT_JOIN_PERSONAL) : group.combProdNm,
          // 유선 상품일 경우, BFF에서 상품명에 개인형, 패밀리형 구분이 되어 있지 않아서 프론트에서 처리 추가
          totBasFeeDcTx: FormatHelper.addComma(String(group.totBasFeeDcTx)),
          combStaDt: DateHelper.getShortDate(group.combStaDt),
          isRepresentation: group.svcMgmtNum === renderCommonInfo.svcInfo.svcMgmtNum
        },
        // 무선 정보
        combinationWirelessMemberList: (resp.result.combinationWirelessMemberList || []).map(member => {
          const wireObj = resp.result.combinationWireMemberList.find(wire => wire.mblSvcMgmtNum === member.svcMgmtNum) || {};

          return {
            ...member,
            auditDtm: member.auditDtm && DateHelper.getShortDate(member.auditDtm),
            aftBasFeeAmtTx: FormatHelper.addComma(String(member.aftBasFeeAmtTx)),
            basFeeAmtTx: FormatHelper.addComma(String(member.basFeeAmtTx)),
            basFeeDcTx: FormatHelper.addComma(String(member.basFeeDcTx)),
            badge: BADGE[member.relClCd],
            iUseYy: MyTHelper.getPeriod({yy: wireObj.useYy}), // 인터넷 적용가입기간
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum),
            asgnNum: FormatHelper.conTelFormatWithDash(member.asgnNum),
            useYy: MyTHelper.getPeriod({yy: member.useYy}) // 휴대폰 적용가입기간
          };
        }),
        // 유선 정보
        combinationWireMemberList: (resp.result.combinationWireMemberList || []).map(member => {
          return {
            ...member,
            useYy: MyTHelper.getPeriod({yy: member.useYy}) // 인터넷 적용가입기간
          };
        })
      };
    });
  }
}
