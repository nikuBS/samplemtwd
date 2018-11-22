/**
 * 인터넷/전화/TV > 구비서류 제출 조회
 * FileName: product.wireplan.join.require-document.apply.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import FormatHelper from '../../../../../utils/format.helper';
import DateHelper from '../../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import product_BFF_10_0078 from '../../../../../mock/server/product.BFF_10_0078.mock';
import {PRODUCT_REQUIRE_DOCUMENT_TYPE_NM} from '../../../../../types/string.type';
import {PRODUCT_RESERVATION_REJECT} from '../../../../../types/bff.type';

class ProductWireplanJoinRequireDocumentApply extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @private
   */
  private _getApi(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0078, {});
  }

  /**
   * @param reqDocInfo
   * @private
   */
  private _converRequireDocumentInfo(reqDocInfo: any): any {
    return Object.assign(reqDocInfo, {
      opDtm: FormatHelper.isEmpty(reqDocInfo.opDtm) ? null :
        DateHelper.getShortDateWithFormat(reqDocInfo.opDtm, 'YYYY.MM.DD'),
      nextDistbDt: FormatHelper.isEmpty(reqDocInfo.nextDistbDt) ? null :
        DateHelper.getShortDateWithFormat(reqDocInfo.nextDistbDt, 'YYYY-MM-DD'),
      resultText: FormatHelper.isEmpty(reqDocInfo.ciaInsptRsnCd) ? reqDocInfo.insptStNm :
        this._getResultText(reqDocInfo.ciaInsptRsnCd, reqDocInfo.ciaInsptRsnNm)
    });
  }

  /**
   * @param ciaInsptRsnCd
   * @param ciaInsptRsnNm
   * @private
   */
  private _getResultText(ciaInsptRsnCd: any, ciaInsptRsnNm: any): any {
    const resultText: any = [];

    ciaInsptRsnCd.split(',').forEach((code) => {
      const insptCode = code.trim();
      if (FormatHelper.isEmpty(PRODUCT_RESERVATION_REJECT['R' + insptCode])) {
        return true;
      }

      resultText.push(PRODUCT_RESERVATION_REJECT['R' + insptCode]);
    });

    if (FormatHelper.isEmpty(resultText)) {
      return ciaInsptRsnNm;
    }

    return resultText;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo = {
      pageInfo: pageInfo,
      svcInfo: svcInfo,
      title: PRODUCT_REQUIRE_DOCUMENT_TYPE_NM.apply
    };

    this._getApi().subscribe((reqDocInfo) => {
      if (reqDocInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: reqDocInfo.code,
          msg: reqDocInfo.msg
        }));
      }

      if (!FormatHelper.isEmpty(reqDocInfo.ciaInsptRsnCd)) {
        return this.error.render(res, renderCommonInfo);
      }

      this.redisService.getData('ProductLedger:' + reqDocInfo.result.svcProdCd)
        .subscribe((prodRedisInfo) => {
          res.render('wireplan/join/product.wireplan.join.require-document.apply.html', {
            reqDocInfo: this._converRequireDocumentInfo(reqDocInfo.result),
            prodRedisInfo: prodRedisInfo,
            svcInfo: svcInfo,
            pageInfo: pageInfo
          });
        });
    });
  }
}

export default ProductWireplanJoinRequireDocumentApply;
