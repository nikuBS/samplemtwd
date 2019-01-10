/**
 * 모바일 요금제 > Data 인피니티 혜택내역 조회
 * FileName: product.mobileplan.lookup.tplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
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

class ProductMobileplanLookupTplan extends TwViewController {
  constructor() {
    super();
  }

  private readonly _prodIdList = {
    NA00006114: 'infiTravelList',
    NA00006115: 'infiMovieList',
    NA00006116: 'infiWatchList',
    NA00006117: 'infiClubList'
  };

  private _listCase = 'A';
  private _listTotal = 0;

  /**
   * @param result
   * @param printProdId
   * @private
   */
  private _parseBenefitList(result, printProdId): any {
    const resultList: any = {};

    this._listCase = 'A';
    this._listTotal = 0;

    switch (printProdId) {
      case 'NA00006114':
      case 'NA00006115':
        result[this._prodIdList[printProdId]].forEach((item, index) => {
          if (FormatHelper.isEmpty(item.issueDt)) {
            return true;
          }

          const issueDtKey = DateHelper.getShortDateWithFormat(item.issueDt, 'YYYY.M.DD.'),
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

          this._listTotal++;
          resultList[yearKey][issueDtKey].list.push(Object.assign(item, {
            issueDt: FormatHelper.isEmpty(item.issueDt) ? '' : DateHelper.getShortDateWithFormat(item.issueDt, 'YYYY.M.DD.'),
            hpnDt: FormatHelper.isEmpty(item.hpnDt) ? '' : DateHelper.getShortDateWithFormat(item.hpnDt, 'YYYY.M.DD.'),
            effDt: FormatHelper.isEmpty(item.effDt) ? '' : DateHelper.getShortDateWithFormat(item.effDt, 'YYYY.M.DD.')
          }));
        });
        break;
      case 'NA00006116':
      case 'NA00006117':
        this._listCase = 'B';
        result[this._prodIdList[printProdId]].forEach((item, index) => {
          if (FormatHelper.isEmpty(item.benfStaDt)) {
            return true;
          }

          const benfStaDtKey = DateHelper.getShortDateWithFormat(item.benfStaDt, 'YYYY.M.DD.'),
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

          this._listTotal++;
          resultList[yearKey][benfStaDtKey].list.push(Object.assign(item, {
            prodNm: printProdId === 'NA00006116' ? item.watchDcNm : item.primProdNm,
            prodLabel: PRODUCT_INFINITY_BENEFIT_PROD_NM[printProdId],
            benfStaDt: FormatHelper.isEmpty(item.benfStaDt) ? '' : DateHelper.getShortDateWithFormat(item.benfStaDt, 'YYYY.M.DD.'),
            benfEndDt: FormatHelper.isEmpty(item.benfEndDt) ? '' : DateHelper.getShortDateWithFormat(item.benfEndDt, 'YYYY.M.DD.')
          }));
        });
        break;
    }

    return resultList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const tDiyGrCd = req.query.s_prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
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

        const printProdId = FormatHelper.isEmpty(tDiyGrCd) ? data.result.beforeTDiyGrCd : tDiyGrCd;
        const currentGrToken = PRODUCT_INFINITY_BENEFIT_NM[data.result.beforeTDiyGrCd].split('_');
        const grToken = PRODUCT_INFINITY_BENEFIT_NM[printProdId].split('_');

        res.render('mobileplan/lookup/product.mobileplan.lookup.tplan.html', Object.assign(renderCommonInfo, {
          beforeTDiyGrNm: currentGrToken.join(' '),
          beforeTDiyGrNmCategory: grToken[1],
          beforeTDiyGrDesc: PRODUCT_INFINITY_BENEFIT[data.result.beforeTDiyGrCd],
          beforeTDiyGrCd: printProdId,
          benefitList: this._parseBenefitList(data.result, printProdId),
          listCase: this._listCase,
          listTotal: this._listTotal
        }));
      });
  }
}

export default ProductMobileplanLookupTplan;
