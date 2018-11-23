/**
 * 인터넷/전화/TV > 가입신청 내역
 * FileName: product.wireplan.join.require-document.history.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_REQUIRE_DOCUMENT_TYPE_NM } from '../../../../../types/string.type';
import { PRODUCT_RESERVATION_REJECT } from '../../../../../types/bff.type';
import DateHelper from '../../../../../utils/date.helper';
import FormatHelper from '../../../../../utils/format.helper';

class ProductWireplanJoinRequireDocumentHistory extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @private
   */
  private _convertReqDocInfo(reqDocInfo): any {
    const nextDistbDt = FormatHelper.isEmpty(reqDocInfo.nextDistbDt) ? null :
      DateHelper.getShortDateWithFormat(reqDocInfo.nextDistbDt, 'YYYY.MM.DD');

    return Object.assign(reqDocInfo, {
      opDtm: FormatHelper.isEmpty(reqDocInfo.opDtm) ? null :
        DateHelper.getShortDateWithFormat(reqDocInfo.opDtm, 'YYYY.MM.DD'),
      nextDistbDt: nextDistbDt,
      resultText: FormatHelper.isEmpty(reqDocInfo.ciaInsptRsnCd) ? reqDocInfo.insptStNm :
        this._getResultText(reqDocInfo.ciaInsptRsnCd, reqDocInfo.ciaInsptRsnNm, nextDistbDt),
      isRetryReservation: !FormatHelper.isEmpty(reqDocInfo.ciaInsptRsnCd)
    });
  }

  /**
   * @param ciaInsptRsnCd
   * @param ciaInsptRsnNm
   * @param nextDistbDt
   * @private
   */
  private _getResultText(ciaInsptRsnCd: any, ciaInsptRsnNm: any, nextDistbDt: any): any {
    const resultText: any = [];

    ciaInsptRsnCd.split(',').forEach((code) => {
      const insptCode = code.trim();
      if (FormatHelper.isEmpty(PRODUCT_RESERVATION_REJECT['R' + insptCode])) {
        return true;
      }

      if (code === '000') {
        resultText.push(PRODUCT_RESERVATION_REJECT['R' + insptCode]).replace('nextDistbDt', nextDistbDt);
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
    const prodId = req.params.prodId || null,
      reqParams: any = {},
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: PRODUCT_REQUIRE_DOCUMENT_TYPE_NM.history
      };

    if (FormatHelper.isEmpty(prodId)) {
      reqParams.svcProdCd = prodId === 'NH00000083' ? 'NH00000084' : prodId;
    }

    this.apiService.request(API_CMD.BFF_10_0078, reqParams)
      .subscribe((reqDocInfo) => {
      if (reqDocInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: reqDocInfo.code,
          msg: reqDocInfo.msg
        }));
      }

      this.redisService.getData('ProductLedger:' + reqDocInfo.result.svcProdCd)
        .subscribe((prodRedisInfo) => {
          res.render('wireplan/join/product.wireplan.join.require-document.history.html', Object.assign(renderCommonInfo, {
            reqDocInfo: this._convertReqDocInfo(reqDocInfo.result),
            prodRedisInfo: prodRedisInfo
          }));
        });
    });
  }
}

export default ProductWireplanJoinRequireDocumentHistory;
