/**
 * 상품 가입시 회선 변경 Process
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { MYT_JOIN_WIRE_SVCATTRCD, PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @class
 */
class ProductCommonLineChange extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param prodTypCd
   * @param pageMode
   * @param targetProdId
   * @param allSvc
   * @param currentSvcMgmtNum
   * @param svcAttrCd
   * @private
   */
  private _getAllowedLineList(prodTypCd: any, pageMode: any, targetProdId: any, allSvc: any, currentSvcMgmtNum: any, svcAttrCd: any): any {
    const allowedSvcAttrInfo: any = this._getAllowedSvcAttrCd(prodTypCd),
      allowedLineList: any = [];

    allSvc[allowedSvcAttrInfo.group].forEach((lineInfo) => {
      if (allowedSvcAttrInfo.svcAttrCds.indexOf(lineInfo.svcAttrCd) === -1 || lineInfo.prodId === targetProdId ||
        pageMode === 'change' && currentSvcMgmtNum === lineInfo.svcMgmtNum) {
        return true;
      }

      allowedLineList.push({
        addr: lineInfo.addr,
        svcMgmtNum: lineInfo.svcMgmtNum,
        svcNum: FormatHelper.conTelFormatWithDash(lineInfo.svcNum),
        svcAttrCd: lineInfo.svcAttrCd,
        fullNm: lineInfo.svcAttrCd === 'M1' || lineInfo.svcAttrCd === 'M2' ?
          MYT_JOIN_WIRE_SVCATTRCD[lineInfo.svcAttrCd] + ' ' + lineInfo.eqpMdlNm : MYT_JOIN_WIRE_SVCATTRCD[lineInfo.svcAttrCd],
        ctgNm: MYT_JOIN_WIRE_SVCATTRCD[lineInfo.svcAttrCd],
        eqpMdlNm: lineInfo.eqpMdlNm
      });
    });

    return allowedLineList;
  }

  /**
   * @param prodTypCd
   * @private
   */
  private _getAllowedSvcAttrCd(prodTypCd: any): any {
    if (['AB', 'C', 'H_P', 'H_A', 'F', 'G'].indexOf(prodTypCd) !== -1) {
      return {
        group: 'm',
        svcAttrCds: ['M1', 'M2', 'M3', 'M4']
      };
    }

    if (['D_I', 'E_I'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S1']
      };
    }

    if (['D_P', 'E_P'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S3']
      };
    }

    if (['D_T', 'E_T'].indexOf(prodTypCd) !== -1) {
      return {
        group: 's',
        svcAttrCds: ['S2']
      };
    }

    return {
      group: null,
      svcAttrCds: []
    };
  }

  /**
   * @param svcInfo
   * @private
   */
  private _convertCurrentLine(svcInfo: any): any {
    return {
      addr: svcInfo.addr,
      svcMgmtNum: svcInfo.svcMgmtNum,
      svcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum),
      svcAttrCd: svcInfo.svcAttrCd,
      fullNm: svcInfo.svcAttrCd === 'M1' || svcInfo.svcAttrCd === 'M2' ?
        MYT_JOIN_WIRE_SVCATTRCD[svcInfo.svcAttrCd] + ' ' + svcInfo.eqpMdlNm : MYT_JOIN_WIRE_SVCATTRCD[svcInfo.svcAttrCd],
      ctgNm: MYT_JOIN_WIRE_SVCATTRCD[svcInfo.svcAttrCd],
      eqpMdlNm: svcInfo.eqpMdlNm
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const targetProdId = req.query.t_prod_id || null,
      targetUrl = req.query.t_url || null,
      pageMode = req.query.p_mod || 'select',
      pageStr = PRODUCT_TYPE_NM.LINE_PROCESS[pageMode.toUpperCase()],
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: pageStr.TITLE,
        button: pageStr.BUTTON,
        description: pageStr.DESCRIPTION
      };

    if (FormatHelper.isEmpty(targetProdId) || FormatHelper.isEmpty(targetUrl) || FormatHelper.isEmpty(pageMode)) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [targetProdId])
      .subscribe((basicInfo) => {
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: basicInfo.code,
            msg: basicInfo.msg
          }));
        }

      const allowedLineList: any = this._getAllowedLineList(basicInfo.result.prodTypCd, pageMode,
        targetProdId, allSvc, svcInfo.svcMgmtNum, svcInfo.svcAttrCd);

      if (FormatHelper.isEmpty(allowedLineList)) {
        return this.error.render(res, renderCommonInfo);
      }

      res.render('common/product.common.line-change.html', Object.assign(renderCommonInfo, {
        allowedLineList: allowedLineList,
        targetProdId: targetProdId,
        targetUrl: targetUrl,
        prodTypCd: basicInfo.result.prodTypCd,
        currentLine: this._convertCurrentLine(svcInfo),
        pageMode: pageMode
      }));
    });
  }
}

export default ProductCommonLineChange;
