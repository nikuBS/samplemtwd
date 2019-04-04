/**
 * 인터넷/전화/TV > 가입신청 내역
 * @file product.wireplan.join.require-document.history.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.08
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import {
  PRODUCT_REQUIRE_DOCUMENT,
  PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT, PRODUCT_REQUIRE_DOCUMENT_RS,
  PRODUCT_REQUIRE_DOCUMENT_TYPE_NM
} from '../../../../../types/string.type';
import DateHelper from '../../../../../utils/date.helper';
import FormatHelper from '../../../../../utils/format.helper';
import { REDIS_KEY } from '../../../../../types/redis.type';
import { Observable } from 'rxjs/Observable';

class ProductWireplanJoinRequireDocumentHistory extends TwViewController {
  constructor() {
    super();
  }

  private _convertProdIds = {
    NH00000103: 'TW00000009',
    NA00005055: 'TW20000012',
    NH00000084: 'TW20000008'
  };

  /**
   * @param reqDocInfo
   * @param isJoined
   * @private
   */
  private _convertReqDocInfo(reqDocInfo: any, isJoined: boolean): any {
    return Object.assign(reqDocInfo, {
      opDtm: FormatHelper.isEmpty(reqDocInfo.opDtm) ? null :
        DateHelper.getShortDateWithFormat(reqDocInfo.opDtm, 'YYYY.M.D.'),
      resultText: this._getResultText(reqDocInfo, isJoined)
    });
  }

  /**
   * @param reqDocInfo
   * @param isJoined
   * @private
   */
  private _getResultText(reqDocInfo: any, isJoined: boolean): any {
    if (FormatHelper.isEmpty(reqDocInfo.ciaInsptRslt) ||
      reqDocInfo.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.NORMAL &&
      reqDocInfo.ciaInsptRslt !== PRODUCT_REQUIRE_DOCUMENT.ABNORMAL) {
      return {
        list: [],
        text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.WORKING
      };
    }

    if (reqDocInfo.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.ABNORMAL) {
      const ciaInsptRsnCd: any = reqDocInfo.ciaInsptRsnCd.split(','),
        nextSchdDt = FormatHelper.isEmpty(reqDocInfo.nextSchdDt) ? null :
          DateHelper.getShortDateWithFormat(reqDocInfo.nextSchdDt, 'YYYY.M.D.'),
        rsnCdList = this._getRsnCdList(ciaInsptRsnCd, nextSchdDt);

      if (rsnCdList.indexOf('000') !== -1 || rsnCdList.indexOf('174') !== -1) {
        return {
          list: rsnCdList,
          text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.NEED_DOCUMENT
        };
      }

      if (FormatHelper.isEmpty(rsnCdList)) {
        return {
          list: [],
          isRetry: true,
          text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.EXPIRE_DOCUMENT
        };
      }

      return {
        list: rsnCdList,
        text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.NEED_DOCUMENT_RETRY
      };
    }

    if ((reqDocInfo.ciaInsptRslt === PRODUCT_REQUIRE_DOCUMENT.NORMAL) && isJoined) {
      return {
        list: [],
        isCompleteAdditional: true,
        text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.COMPLETE_ADDITIONAL
      };
    }

    return {
      list: [],
      isComlete: true,
      text: PRODUCT_REQUIRE_DOCUMENT_APPLY_RESULT.COMPLETE
    };
  }

  /**
   * @param rsnCdList
   * @param nextSchdDt
   * @private
   */
  private _getRsnCdList(rsnCdList: any, nextSchdDt: any): any {
    const resultText: any = [];

    rsnCdList.forEach((code) => {
      const insptCode = code.trim();
      if (FormatHelper.isEmpty(PRODUCT_REQUIRE_DOCUMENT_RS['R' + insptCode])) {
        return true;
      }

      if (insptCode === '000') {
        resultText.push(PRODUCT_REQUIRE_DOCUMENT_RS['R' + insptCode].replace('YYYYMDD', nextSchdDt));
        return true;
      }

      resultText.push(PRODUCT_REQUIRE_DOCUMENT_RS['R' + insptCode]);
    });

    return resultText;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      reqParams: any = {},
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_REQUIRE_DOCUMENT_TYPE_NM.history
      };

    if (!FormatHelper.isEmpty(prodId)) {
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

      if (reqDocInfo.result.necessaryDocumentInspectInfoList.length < 1) {
        return this.error.render(res, renderCommonInfo);
      }

      let getProdId: any = reqDocInfo.result.necessaryDocumentInspectInfoList[0].svcProdCd;

      if (getProdId === 'NH00000083') {
        getProdId = 'NH00000084';
      }

      if (!FormatHelper.isEmpty(this._convertProdIds[reqDocInfo.result.necessaryDocumentInspectInfoList[0].svcProdCd])) {
        getProdId = this._convertProdIds[reqDocInfo.result.necessaryDocumentInspectInfoList[0].svcProdCd];
      }

      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0119, {}, null, [reqDocInfo.result.necessaryDocumentInspectInfoList[0].svcProdCd]),
        this.redisService.getData(REDIS_KEY.PRODUCT_INFO + getProdId)
      ).subscribe(([ combineInfo, prodRedisInfo ]) => {
        if (prodRedisInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: prodRedisInfo.code,
            msg: prodRedisInfo.msg
          }));
        }

        const isJoined = combineInfo.result.combiProdScrbYn === 'Y';

        res.render('wireplan/join/product.wireplan.join.require-document.history.html', Object.assign(renderCommonInfo, {
          reqDocInfo: this._convertReqDocInfo(reqDocInfo.result.necessaryDocumentInspectInfoList[0], isJoined),
          prodRedisInfo: prodRedisInfo.result
        }));
      });
    });
  }
}

export default ProductWireplanJoinRequireDocumentHistory;
