/**
 * FileName: product.benefit-usage-history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_INFINITY_BENEFIT, PRODUCT_INFINITY_BENEFIT_NM, PRODUCT_INFINITY_BENEFIT_PROD_NM } from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';

class ProductInfinityBenefitUsageHistory extends TwViewController {
  constructor() {
    super();
  }

  private _prodIdList = {
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

          const issueDtKey = DateHelper.getShortDateWithFormat(item.issueDt, 'MM.DD');
          if (FormatHelper.isEmpty(resultList[issueDtKey])) {
            resultList[issueDtKey] = {
              issueDtKey: issueDtKey,
              list: []
            };
          }

          this._listTotal++;
          resultList[issueDtKey].list.push(Object.assign(item, {
            issueDt: FormatHelper.isEmpty(item.issueDt) ? '' : DateHelper.getShortDateWithFormat(item.issueDt, 'YY.MM.DD'),
            hpnDt: FormatHelper.isEmpty(item.hpnDt) ? '' : DateHelper.getShortDateWithFormat(item.hpnDt, 'YY.MM.DD'),
            effDt: FormatHelper.isEmpty(item.effDt) ? '' : DateHelper.getShortDateWithFormat(item.effDt, 'YY.MM.DD'),
            multipleClass: index > 0 ? 'multiple' : ''
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

          const benfStaDtKey = DateHelper.getShortDateWithFormat(item.benfStaDt, 'MM.DD');
          if (FormatHelper.isEmpty(resultList[benfStaDtKey])) {
            resultList[benfStaDtKey] = {
              benfStaDtKey: benfStaDtKey,
              list: []
            };
          }

          this._listTotal++;
          resultList[benfStaDtKey].list.push(Object.assign(item, {
            prodNm: printProdId === 'NA00006116' ? item.watchDcNm : item.primProdNm,
            prodLabel: PRODUCT_INFINITY_BENEFIT_PROD_NM[printProdId],
            benfStaDt: FormatHelper.isEmpty(item.benfStaDt) ? '' : DateHelper.getShortDateWithFormat(item.benfStaDt, 'YY.MM.DD'),
            benfEndDt: FormatHelper.isEmpty(item.benfEndDt) ? '' : DateHelper.getShortDateWithFormat(item.benfEndDt, 'YY.MM.DD'),
            multipleClass: index > 0 ? 'multiple' : ''
          }));
        });
        break;
    }

    return resultList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const tDiyGrCd = req.query.prod_id || '';

    this.apiService.request(API_CMD.BFF_10_0015, { tDiyGrCd: tDiyGrCd }, {}, 'NA00005959')
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            title: '혜택 이용내역',
            code: data.code,
            msg: data.msg,
            svcInfo: svcInfo
          });
        }

        const printProdId = FormatHelper.isEmpty(tDiyGrCd) ? data.result.beforeTDiyGrCd : tDiyGrCd;
        const currentGrToken = PRODUCT_INFINITY_BENEFIT_NM[data.result.beforeTDiyGrCd].split('_');
        const grToken = PRODUCT_INFINITY_BENEFIT_NM[printProdId].split('_');

        res.render('product.infinity-benefit-usage-history.html', {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          beforeTDiyGrNm: currentGrToken.join(' '),
          beforeTDiyGrNmCategory: grToken[1],
          beforeTDiyGrDesc: PRODUCT_INFINITY_BENEFIT[data.result.beforeTDiyGrCd],
          beforeTDiyGrCd: printProdId,
          benefitList: this._parseBenefitList(data.result, printProdId),
          listCase: this._listCase,
          listTotal: this._listTotal
        });
      });
  }
}

export default ProductInfinityBenefitUsageHistory;
