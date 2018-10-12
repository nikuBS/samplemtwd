/**
 * FileName: product.benefit-usage-history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_INFINITY_BENEFIT, PRODUCT_INFINITY_BENEFIT_PROD_NM } from '../../../types/string.type';
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
   * @private
   */
  private _parseBenefitList(result): any {
    const resultList: any = {};

    switch (result.beforeTDiyGrCd) {
      case 'NA00006114':
      case 'NA00006115':
        result[this._prodIdList[result.beforeTDiyGrCd]].forEach((item, index) => {
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
        result[this._prodIdList[result.beforeTDiyGrCd]].forEach((item, index) => {
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
            prodNm: result.beforeTDiyGrCd === 'NA00006116' ? item.watchDcNm : item.primProdNm,
            prodLabel: PRODUCT_INFINITY_BENEFIT_PROD_NM[result.beforeTDiyGrCd],
            benfStaDt: FormatHelper.isEmpty(item.benfStaDt) ? '' : DateHelper.getShortDateWithFormat(item.benfStaDt, 'YY.MM.DD'),
            benfEndDt: FormatHelper.isEmpty(item.benfEndDt) ? '' : DateHelper.getShortDateWithFormat(item.benfEndDt, 'YY.MM.DD'),
            multipleClass: index > 0 ? 'multiple' : ''
          }));
        });
        break;
    }

    return resultList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
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

        // @todo 카테고리를 바꿔도 API 에서 현재 인피니티 혜택으로 줘서 ...
        if (!FormatHelper.isEmpty(tDiyGrCd) && (tDiyGrCd !== data.result.beforeTDiyGrCd)) {
          return this.error.render(res, {
            title: '혜택 이용내역',
            svcInfo: svcInfo
          });
        }

        const grToken = data.result.beforeTDiyGrNm.split('_');

        res.render('product.infinity-benefit-usage-history.html', {
          svcInfo: svcInfo,
          beforeTDiyGrNm: grToken.join(' '),
          beforeTDiyGrNmCategory: grToken[1],
          beforeTDiyGrDesc: PRODUCT_INFINITY_BENEFIT[data.result.beforeTDiyGrCd],
          beforeTDiyGrCd: data.result.beforeTDiyGrCd,
          benefitList: this._parseBenefitList(data.result),
          listCase: this._listCase,
          listTotal: this._listTotal
        });
      });
  }
}

export default ProductInfinityBenefitUsageHistory;
