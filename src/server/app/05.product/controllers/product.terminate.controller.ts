/**
 * FileName: product.terminate.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.13
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_SETTING } from '../../../mock/server/product.display-ids.mock';

class ProductTerminate extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  /**
   * @param joinTermInfo
   * @private
   */
  private _convertAdditionsJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: this._convertAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: FormatHelper.isEmpty(joinTermInfo.stipulationInfo) ? '' : this._convertStipulationInfo(joinTermInfo.stipulationInfo)
    });
  }

  /**
   * @param preInfo
   * @private
   */
  private _convertAdditionsPreInfo(preInfo): any {
    const isNumberBasFeeInfo = !isNaN(parseInt(preInfo.reqProdInfo.basFeeInfo, 10));

    return Object.assign(preInfo, {
      reqProdInfo: Object.assign(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      }),
      autoJoinList: this._convertAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: this._convertAutoJoinTermList(preInfo.autoTermList)
    });
  }

  /**
   * @param stipulationInfo
   * @private
   */
  private _convertStipulationInfo(stipulationInfo): any {
    if (!stipulationInfo.existData) {
      return {};
    }

    return Object.assign(stipulationInfo, {
      stipulation: Object.assign(stipulationInfo.stipulation, {
        termStplAgreeCttSummary: stipulationInfo.stipulation.termStplAgreeYn === 'Y' ?
            this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.termStplAgreeHtmlCtt) : ''
      })
    });
  }

  /**
   * @param html
   * @private
   */
  private _getStripTagsAndSubStrTxt(html): any {
    return html.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  }

  /**
   * @private
   */
  private _getDisplayId(): any {
    let displayId: any = null;

    Object.keys(PRODUCT_SETTING).forEach((key) => {
      if (PRODUCT_SETTING[key].indexOf(this._prodId) !== -1) {
        displayId = key;
        return false;
      }
    });

    return displayId;
  }

  /**
   * @param autoList
   * @private
   */
  private _convertAutoJoinTermList(autoList): any {
    const autoListConvertResult: any = [];

    autoList.forEach((item) => {
      if (FormatHelper.isEmpty(autoListConvertResult[item.svcProdCd])) {
        autoListConvertResult[item.svcProdCd] = {
          svcProdNm: item.svcProdNm,
          svcProdList: []
        };
      }

      autoListConvertResult[item.svcProdCd].svcProdList.push(item.prodNm);
    });

    return autoListConvertResult;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '03' }, {}, this._prodId),
      this.redisService.getData('ProductChangeApi:' + this._prodId + 'TM')
    ).subscribe(([ joinTermInfo, terminateRedisInfo ]) => {
      if (joinTermInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: joinTermInfo.code,
          msg: joinTermInfo.msg,
          svcInfo: svcInfo
        });
      }

      res.render('product.terminate.html', {
        prodId: this._prodId,
        svcInfo: svcInfo,
        joinTermInfo: this._convertAdditionsJoinTermInfo(joinTermInfo.result),
        terminateApiCode: FormatHelper.isEmpty(terminateRedisInfo) ? '' : terminateRedisInfo.bffApiCode,
        displayId: this._getDisplayId()
      });
    });
  }
}

export default ProductTerminate;
