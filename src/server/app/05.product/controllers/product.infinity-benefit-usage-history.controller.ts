/**
 * FileName: product.benefit-usage-history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_INFINITY_BENEFIT } from '../../../types/string.type';
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

  private _limitListCount = 20;

  private _parseBenefitList(result): any {
    let resultList = [];

    switch(result.beforeTDiyGrCd) {
      case 'NA00006114':
      case 'NA00006115':
        resultList = result[this._prodIdList[result.beforeTDiyGrCd]].map((item, index) => {
          return Object.assign(item, {
            issueDt: FormatHelper.isEmpty(item.issueDt) ? '' : DateHelper.getShortDateWithFormat(item.rgstDt, 'YY.MM.DD'),
            hpnDt: FormatHelper.isEmpty(item.hpnDt) ? '' : DateHelper.getShortDateWithFormat(item.hpnDt, 'YY.MM.DD'),
            effDt: FormatHelper.isEmpty(item.effDt) ? '' : DateHelper.getShortDateWithFormat(item.effDt, 'YY.MM.DD'),
            display: index < this._limitListCount ? '' : 'style="display: none"'
          });
        });
        break;
      case 'NA00006116':
      case 'NA00006117':
        resultList = result[this._prodIdList[result.beforeTDiyGrCd]].map((item, index) => {
          return Object.assign(item, {
            benfStaDt: FormatHelper.isEmpty(item.benfStaDt) ? '' : DateHelper.getShortDateWithFormat(item.benfStaDt, 'YY.MM.DD'),
            benfEndDt: FormatHelper.isEmpty(item.benfEndDt) ? '' : DateHelper.getShortDateWithFormat(item.benfEndDt, 'YY.MM.DD'),
            display: index < this._limitListCount ? '' : 'style="display: none"'
          });
        });
        break;
    }

    return resultList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this.apiService.request(API_CMD.BFF_10_0015, {}, {}, 'NA00005959')
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(data.code, data.msg);
        }

        res.render('product.benefit-usage-history.html', {
          svcInfo: svcInfo,
          beforeTDiyGrNm: data.beforeTDiyGrNm.split('_').join(' '),
          beforeTDiyGrDesc: PRODUCT_INFINITY_BENEFIT[data.result.beforeTDiyGrCd],
          beforeTDiyGrCd: data.result.beforeTDiyGrCd,
          benefitList: this._parseBenefitList(data.result)
        });
      });
  }
}

export default ProductInfinityBenefitUsageHistory;
