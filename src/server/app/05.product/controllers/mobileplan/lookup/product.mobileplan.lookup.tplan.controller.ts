/**
 * 모바일 요금제 > Data 인피니티 혜택내역 조회
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-01
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import {
  PRODUCT_INFINITY_BENEFIT,
  PRODUCT_INFINITY_BENEFIT_NM,
  PRODUCT_INFINITY_BENEFIT_PROD_NM,
  PRODUCT_TYPE_NM
} from '../../../../../types/string.type';
import DateHelper from '../../../../../utils/date.helper';

/**
 * @class
 */
class ProductMobileplanLookupTplan extends TwViewController {
  constructor() {
    super();
  }

  /* 상품코드별 API 응답 값 내 목록 필드명 분기처리 */
  private readonly _prodIdList = {
    NA00006114: 'infiTravel',
    NA00006115: 'infiMovieList',
    NA00006116: 'infiWatchList',
    NA00006117: 'infiClubList'
  };

  /**
   * 혜택 목록 변환
   * @param result - API 응답 값
   * @param printProdId - 혜택 상품코드
   * @param tabId - 탭 ID
   */
  private _parseBenefitList(result: any, printProdId: any, tabId?: any): any {
    let resultList: any = {};

    let listCase: any = 'A';
    let listTotal: any = 0;

    switch (printProdId) {
      case 'NA00006114':
        const convTravelInfo: any = this._convertTravelAndMovieList(result[this._prodIdList[printProdId]][tabId === 'onepass' ?
          'infiRomList' : 'infiMatinaList']);
        resultList = convTravelInfo.list;
        listTotal = result[this._prodIdList[printProdId]].infiRomList.length + result[this._prodIdList[printProdId]].infiMatinaList.length;
        break;
      case 'NA00006115':
        const convMovieInfo: any = this._convertTravelAndMovieList(result[this._prodIdList[printProdId]]);
        resultList = convMovieInfo.list;
        listTotal = convMovieInfo.listTotal;
        break;
      case 'NA00006116':
      case 'NA00006117':
        listCase = 'B';
        result[this._prodIdList[printProdId]].forEach((item, index) => {
          if (FormatHelper.isEmpty(item.benfStaDt)) {
            return true;
          }

          const benfStaDtKey = DateHelper.getShortDateWithFormat(item.benfStaDt, 'YYYY.M.D.'),
            yearKey = DateHelper.getShortDateWithFormat(item.benfStaDt, 'YYYY');

          if (FormatHelper.isEmpty(resultList[yearKey])) {
            resultList[yearKey] = {};
          }

          if (FormatHelper.isEmpty(resultList[yearKey][benfStaDtKey])) {
            resultList[yearKey][benfStaDtKey] = {
              benfStaDtKey: benfStaDtKey,
              list: []
            };
          }

          listTotal++;
          resultList[yearKey][benfStaDtKey].list.push(Object.assign(item, {
            prodNm: printProdId === 'NA00006116' ? item.watchDcNm : item.primProdNm,
            prodLabel: PRODUCT_INFINITY_BENEFIT_PROD_NM[printProdId],
            benfStaDt: FormatHelper.isEmpty(item.benfStaDt) ? '' : DateHelper.getShortDateWithFormat(item.benfStaDt, 'YYYY.M.D.'),
            benfEndDt: FormatHelper.isEmpty(item.benfEndDt) ? '' : DateHelper.getShortDateWithFormat(item.benfEndDt, 'YYYY.M.D.')
          }));
        });
        break;
    }

    return {
      listCase: listCase,
      listTotal: listTotal,
      list: resultList,
    };
  }

  /**
   * 여행/영화 목록 변환
   * @param list - 목록 배열
   */
  private _convertTravelAndMovieList(list: any): any {
    const resultList: any = {};
    let listTotal: any = 0;

    list.forEach((item, index) => {
      if (FormatHelper.isEmpty(item.issueDt)) {
        return true;
      }

      const issueDtKey = DateHelper.getShortDateWithFormat(item.issueDt, 'YYYY.M.D.'),
        yearKey = DateHelper.getShortDateWithFormat(item.issueDt, 'YYYY');

      if (FormatHelper.isEmpty(resultList[yearKey])) {
        resultList[yearKey] = {};
      }

      if (FormatHelper.isEmpty(resultList[yearKey][issueDtKey])) {
        resultList[yearKey][issueDtKey] = {
          issueDtKey: issueDtKey,
          list: []
        };
      }

      listTotal++;
      resultList[yearKey][issueDtKey].list.push(Object.assign(item, {
        issueDt: FormatHelper.isEmpty(item.issueDt) ? '' : DateHelper.getShortDateWithFormat(item.issueDt, 'YYYY.M.D.'),
        hpnDt: FormatHelper.isEmpty(item.hpnDt) ? '' : DateHelper.getShortDateWithFormat(item.hpnDt, 'YYYY.M.D.'),
        effDt: FormatHelper.isEmpty(item.effDt) ? '' : DateHelper.getShortDateWithFormat(item.effDt, 'YYYY.M.D.')
      }));
    });

    return {
      list: resultList,
      listTotal: listTotal
    };
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
    const tDiyGrCd = req.query.s_prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.LOOKUP.TPLAN
      };

    const reqParams: any = {};

    if (!FormatHelper.isEmpty(tDiyGrCd)) {
      reqParams.tDiyGrCd = tDiyGrCd;
    }

    this.apiService.request(API_CMD.BFF_10_0015, reqParams, {}, ['NA00005959'])
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: data.code,
            msg: data.msg
          }));
        }

        if (FormatHelper.isEmpty(PRODUCT_INFINITY_BENEFIT_NM[data.result.beforeTDiyGrCd])) {
          return this.error.render(res, renderCommonInfo);
        }

        const printProdId = FormatHelper.isEmpty(tDiyGrCd) ? data.result.beforeTDiyGrCd : tDiyGrCd,
          currentGrToken = PRODUCT_INFINITY_BENEFIT_NM[data.result.beforeTDiyGrCd].split('_'),
          grToken = PRODUCT_INFINITY_BENEFIT_NM[printProdId].split('_');

        let tabId: any = req.query.tab_id || null;
        if (printProdId === 'NA00006114' && FormatHelper.isEmpty(tabId)) {
          tabId = 'onepass';
        }

        const convertBenefitInfo: any = this._parseBenefitList(data.result, printProdId, tabId);

        res.render('mobileplan/lookup/product.mobileplan.lookup.tplan.html', Object.assign(renderCommonInfo, {
          beforeTDiyGrNm: currentGrToken.join(' '),
          beforeTDiyGrNmCategory: grToken[1],
          beforeTDiyGrDesc: PRODUCT_INFINITY_BENEFIT[data.result.beforeTDiyGrCd],
          beforeTDiyGrCd: printProdId,
          benefitList: convertBenefitInfo.list,
          listCase: convertBenefitInfo.listCase,
          listTotal: convertBenefitInfo.listTotal,
          tabId: tabId
        }));
      });
  }
}

export default ProductMobileplanLookupTplan;
