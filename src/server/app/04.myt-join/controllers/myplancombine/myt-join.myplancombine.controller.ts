/**
 * @file 나의 결합상품 < 나의 가입 정보 < MyT
 * @author Jiyoung Jo
 * @since 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { COMBINATION_PRODUCT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {
  MYT_JOIN_PERSONAL,
  MYT_JOIN_FAMILY,
  MYT_JOIN_MYPLANCOMBINE,
  MYT_STRING_KOR_TERM,
  MYT_JOIN_WIRE_SET_PAUSE
} from '../../../../types/string.type';

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
    if (req.params.combination) { // last path에 prodId가 추가되어 있을 경우 결합가족보기(유선상품의 경우 결합상품보기)
      const prodId = req.params.combination;
      const pageId = COMBINATION_PRODUCT[prodId || '']; // 하나의 결합상품에 prodId가 여러개 매핑되어 있는 경우도 있고, 여러개의 상품이 하나의 html을 쓰는 경우도 있어 별도의 식별자 추가함

      if (!pageId) {  // pageId가 없는 경우 에러 페이지 랜딩
        return this.error.render(res, {
          pageInfo: pageInfo,
          svcInfo
        });
      }

      this.getCombination(prodId, svcInfo, req.query.type, pageInfo).subscribe(combination => {
        if (combination.code) {
          return this.error.render(res, {
            pageInfo: pageInfo,
            ...combination,
            svcInfo
          });
        }

        res.render('myplancombine/myt-join.myplancombine.combination.html', { svcInfo, pageInfo, combination, pageId, prodId, type: req.query.type });
      });
    } else {  // 결합상품 목록 페이지로 랜딩
      this._getCombinations().subscribe(combinations => {
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

  /**
   * @desc 결합상품 리스트 가져오기
   * @private
   */
  private _getCombinations = () => {
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

  /**
   * @desc 결합 가족 가져오기
   * @param  {string} id 결합상품 id
   * @param  {any} svcInfo 세션 정보
   * @param  {string} type TB결합상품에 대해서 BFF에 개인형/패밀리형 구분이 없어서 FE에서 query param로 받음
   * @param  {any} pageInfo
   * @private
   */
  private getCombination = (id, svcInfo, type, pageInfo) => {
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
      let totalUseYy = 0 // 총 적용 가입기간(년도)
          , totalUseMm = 0; // 총 적용 가입기간(월)

      // 가족 합산 총 가입기간 더하기
      const addTotalUse = (useYy, useMm) => {
        totalUseYy += Number(useYy) || 0;
        totalUseMm += Number(useMm) || 0;
      };

      // 마스킹 유무에 따른 날짜값 반환
      const getDateByMasking = (date) => {
        // 마스킹 상태인 경우 강제로 [*년 *개월] 로 리턴해준다.
        if (!pageInfo.masking) {
          return MYT_JOIN_MYPLANCOMBINE.DATE_FORMAT.replace('{0}', '*').replace('{1}', '*');
        }
        return date;
      };

      // B상품 사용기간 날짜 포맷팅
      resp.result.combinationWireMemberList.forEach( item => {
        item.useYearCnt = getDateByMasking(item.useYearCnt);
      });

      const combinationWirelessMemberList = (resp.result.combinationWirelessMemberList || []).map(member => {
        addTotalUse(member.useYy, member.useMm);

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
          asgnNum: FormatHelper.conTelFormatWithDash(member.asgnNum),
          useYearCnt: getDateByMasking(member.useYearCnt),
          expDate: getTextDate(member.totMYy, member.totMMm)
        };
      });

      // 년도(yy), 월(mm) 값이 0이 아닌경우만 노출. 둘다 0 이면 하이픈(-)
      const getTextDate = (yy, mm) => {
        yy = yy ? yy.toString() : '0';
        mm = mm ? mm.toString() : '0';

        const template = MYT_JOIN_MYPLANCOMBINE.DATE_FORMAT;
        let text = '';
        // 마스킹 상태인 경우
        if (!pageInfo.masking) {
          return template.replace('{0}', yy).replace('{1}', mm);
        }
        // 년도 가 0이 아닌경우
        if (yy !== '0') {
          text = yy + MYT_STRING_KOR_TERM.year;
        }
        if (mm !== '0') {
          text += ' ' + mm + MYT_JOIN_WIRE_SET_PAUSE.MONTH;
        }
        if (yy === '0' && mm === '0') {
          return '-';
        }
        return text.trim();
      };

      // 가족 합산 총 가입기간 텍스트 변환
      const getTotalUseDate = () => {
        // 마스킹 상태인 경우
        if (!pageInfo.masking) {
          return getTextDate('*', '*');
        }
        totalUseYy += Math.floor(totalUseMm / 12);
        totalUseMm = totalUseMm % 12;
        return getTextDate(totalUseYy, totalUseMm);
     };

      return {
        ...resp.result,
        combinationGroup: {
          ...group,
          combProdNm: type && type === '1' ? group.combProdNm.replace(MYT_JOIN_FAMILY, MYT_JOIN_PERSONAL) : group.combProdNm,
          // 유선 상품일 경우, BFF에서 상품명에 개인형, 패밀리형 구분이 되어 있지 않아서 프론트에서 처리 추가
          totBasFeeDcTx: FormatHelper.addComma(String(group.totBasFeeDcTx)),
          combStaDt: DateHelper.getShortDate(group.combStaDt),
          isRepresentation: group.svcMgmtNum === svcInfo.svcMgmtNum,
          totUseYyText: getTotalUseDate()
        },
        combinationWirelessMemberList
      };
    });
  }
}
