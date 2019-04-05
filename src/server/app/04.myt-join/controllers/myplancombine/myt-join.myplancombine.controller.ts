/**
 * FileName: myt-join.myplancombine.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { COMBINATION_PRODUCT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_PERSONAL, MYT_JOIN_FAMILY } from '../../../../types/string.type';

export default class MyTJoinMyPlanCombine extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    if (req.params.combination) { // last path에 prodId가 추가되어 있을 경우 결합가족보기(유선상품의 경우 결합상품보기)
      const prodId = req.params.combination;
      const pageId = COMBINATION_PRODUCT[prodId || '']; // 하나의 결합상품에 prodId가 여러개 매핑되어 있는 경우도 있고, 여러개의 상품이 하나의 html을 쓰는 경우도 있어 별도의 식별자 추가함

      if (!pageId) {  // pageId가 없는 경우 에러 페이지 랜딩
        return this.error.render(res, {
          pageInfo: pageInfo,
          svcInfo
        });
      }

      this.getCombination(prodId, svcInfo, req.query.type).subscribe(combination => {
        if (combination.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            ...combination,
            svcInfo
          });
        }

        res.render('myplancombine/myt-join.myplancombine.combination.html', { svcInfo, pageInfo, combination, pageId, prodId });
      });
    } else {  // 결합상품 목록 페이지로 랜딩
      this.getCombinations().subscribe(combinations => {
        if (combinations.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            ...combinations,
            svcInfo
          });
        }

        res.render('myplancombine/myt-join.myplancombine.html', {
          svcInfo,
          pageInfo,
          combinations
        });
      });
    }
  }

  private getCombinations = () => { // 결합 상품 리스트 가져오기 
    return this.apiService.request(API_CMD.BFF_05_0133, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return (resp.result.combinationMemberList || []).map(comb => {
        return {
          ...comb,
          scrbDt: DateHelper.getShortDate(comb.scrbDt)
        };
      });
    });
  }

  private getCombination = (id, svcInfo, type) => { // 결합 가족 가져오기
    return this.apiService.request(API_CMD.BFF_05_0134, {}, {}, [id]).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
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
          combProdNm: type && type === '1' ? group.combProdNm.replace(MYT_JOIN_FAMILY, MYT_JOIN_PERSONAL) : group.combProdNm,
          // 유선 상품일 경우, BFF에서 상품명에 개인형, 패밀리형 구분이 되어 있지 않아서 프론트에서 처리 추가
          totBasFeeDcTx: FormatHelper.addComma(String(group.totBasFeeDcTx)),
          combStaDt: DateHelper.getShortDate(group.combStaDt),
          isRepresentation: group.svcMgmtNum === svcInfo.svcMgmtNum
        },
        combinationWirelessMemberList: (resp.result.combinationWirelessMemberList || []).map(member => {
          return {
            ...member,
            auditDtm: member.auditDtm && DateHelper.getShortDate(member.auditDtm),
            aftBasFeeAmtTx: FormatHelper.addComma(String(member.aftBasFeeAmtTx)),
            basFeeAmtTx: FormatHelper.addComma(String(member.basFeeAmtTx)),
            basFeeDcTx: FormatHelper.addComma(String(member.basFeeDcTx)),
            badge: BADGE[member.relClCd],
            bIdx: resp.result.combinationWireMemberList.findIndex(wire => {
              return wire.mblSvcMgmtNum === member.svcMgmtNum;
            }),
            svcNum: FormatHelper.conTelFormatWithDash(member.svcNum),
            asgnNum: FormatHelper.conTelFormatWithDash(member.asgnNum)
          };
        })
      };
    });
  }
}
