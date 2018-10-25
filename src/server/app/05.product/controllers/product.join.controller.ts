/**
 * FileName: product.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { PRODUCT_SETTING, PRODUCT_JOIN } from '../../../mock/server/product.display-ids.mock';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PROD_CTG_CD_CODE, UNIT } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../utils/browser.helper';

class ProductJoin extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;
  private _displayId;
  private _ignoreProdId = ['MP_02_02_03_14'];

  /**
   * @private
   */
  private _setDisplayId(): any {
    let displayId: any = null;

    Object.keys(PRODUCT_JOIN).forEach((key) => {
      if (PRODUCT_JOIN[key].indexOf(this._prodId) !== -1) {
        displayId = key;
        return false;
      }
    });

    if (FormatHelper.isEmpty(displayId)) {
      Object.keys(PRODUCT_SETTING).forEach((key) => {
        if (PRODUCT_SETTING[key].indexOf(this._prodId) !== -1) {
          displayId = key;
          return false;
        }
      });
    }

    if (!FormatHelper.isEmpty(displayId)) {
      this._displayId = displayId;
    } else {
      this._displayId = null;
    }

    this._setIgnoreJoinDisplayId();
  }

  /**
   * @private
   */
  private _setIgnoreJoinDisplayId(): any {
    if (this._ignoreProdId.indexOf(this._displayId) !== -1) {
      this._displayId = null;
    }
  }

  /**
   * @param ctgCd
   * @private
   */
  private _getDisplayGroup(ctgCd): any {
    return PROD_CTG_CD_CODE[ctgCd];
  }

  /**
   * @param joinTermInfo
   * @private
   */
  private _convertPlansJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: this._convertPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: this._convertInstallmentAgreement(joinTermInfo.installmentAgreement),
      stipulationInfo: this._convertStipulationInfo(joinTermInfo.stipulationInfo)
    });
  }

  /**
   * @param installmentAgreement
   * @private
   */
  private _convertInstallmentAgreement(installmentAgreement): any {
    const isNumberPenAmt = !isNaN(parseInt(installmentAgreement.penAmt, 10)),
      isNumberFrDcAmt = !isNaN(parseInt(installmentAgreement.frDcAmt, 10)),
      isNumberToDcAmt = !isNaN(parseInt(installmentAgreement.toDcAmt, 10)),
      isNumberGapDcAmt = !isNaN(parseInt(installmentAgreement.gapDcAmt, 10));

    return Object.assign(installmentAgreement, {
      isNumberPenAmt: isNumberPenAmt,
      penAmt: isNumberPenAmt ? FormatHelper.addComma(installmentAgreement.penAmt) : installmentAgreement.penAmt,
      isNumberFrDcAmt: isNumberFrDcAmt,
      frDcAmt: isNumberFrDcAmt ? FormatHelper.addComma(installmentAgreement.frDcAmt) + UNIT['110'] : installmentAgreement.frDcAmt,
      isNumberToDcAmt: isNumberToDcAmt,
      toDcAmt: isNumberToDcAmt ? FormatHelper.addComma(installmentAgreement.toDcAmt) + UNIT['110'] : installmentAgreement.toDcAmt,
      isNumberGapDcAmt: isNumberGapDcAmt,
      gapDcAmt: isNumberGapDcAmt ? FormatHelper.addComma(installmentAgreement.gapDcAmt) + UNIT['110'] : installmentAgreement.gapDcAmt,
      agrmtDayCnt: this._calcAgrmtMonth(installmentAgreement.agrmtDayCnt),
      agrmtUseCnt: this._calcAgrmtMonth(installmentAgreement.agrmtUseCnt)
    });
  }

  /**
   * @param days
   * @private
   */
  private _calcAgrmtMonth(days): any {
    return days / 30.4;
  }

  /**
   * @param stipulationInfo
   * @private
   */
  private _convertStipulationInfo(stipulationInfo): any {
    if (FormatHelper.isEmpty(stipulationInfo) || FormatHelper.isEmpty(stipulationInfo.stipulation)) {
      return null;
    }

    return Object.assign(stipulationInfo, {
      stipulation: Object.assign(stipulationInfo.stipulation, {
        scrbStplAgreeCttSummary: stipulationInfo.stipulation.scrbStplAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.scrbStplAgreeHtmlCtt) : '',
        psnlInfoCnsgCttSummary: stipulationInfo.stipulation.psnlInfoCnsgAgreeYn === 'Y' ?
          this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoCnsgHtmlCtt) : '',
        psnlInfoOfrCttSummary: stipulationInfo.stipulation.psnlInfoOfrAgreeYn === 'Y' ?
            this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoOfrHtmlCtt) : '',
        adInfoOfrCttSummary: stipulationInfo.stipulation.adInfoOfrAgreeYn === 'Y' ?
            this._getStripTagsAndSubStrTxt(stipulationInfo.stipulation.psnlInfoCnsgHtmlCtt) : '',
        existsCount: this._getStipulationYnCnt([stipulationInfo.stipulation.scrbStplAgreeYn, stipulationInfo.stipulation.psnlInfoCnsgAgreeYn,
          stipulationInfo.stipulation.psnlInfoOfrAgreeYn, stipulationInfo.stipulation.adInfoOfrAgreeYn])
      })
    });
  }

  /**
   * @param yNarray
   * @private
   */
  private _getStipulationYnCnt(yNarray): any {
    let count = 0;

    yNarray.forEach((flag) => {
      if (flag === 'Y') {
        count++;
      }
    });

    return count;
  }

  /**
   * @param html
   * @private
   */
  private _getStripTagsAndSubStrTxt(html): any {
    return html.replace(/(<([^>]+)>)|&nbsp;/ig, '');
  }

  /**
   * @param preInfo
   * @private
   */
  private _convertPlanPreInfo(preInfo): any {
    return Object.assign(preInfo, {
      frProdInfo: Object.assign(preInfo.frProdInfo, FormatHelper.convProductSpecifications(preInfo.frProdInfo.basFeeInfo,
          preInfo.frProdInfo.basOfrDataQtyCtt, preInfo.frProdInfo.basOfrVcallTmsCtt, preInfo.frProdInfo.basOfrCharCntCtt)),
      toProdInfo: Object.assign(preInfo.toProdInfo, FormatHelper.convProductSpecifications(preInfo.toProdInfo.basFeeInfo,
          preInfo.toProdInfo.basOfrDataQtyCtt, preInfo.toProdInfo.basOfrVcallTmsCtt, preInfo.toProdInfo.basOfrCharCntCtt)),
      autoJoinList: this._convertAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: this._convertAutoJoinTermList(preInfo.autoTermList)
    });
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

  /**
   * @param joinTermInfo
   * @private
   */
  private _convertAdditionsJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: this._convertAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: this._convertStipulationInfo(joinTermInfo.stipulationInfo)
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


  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._prodId = req.params.prodId;
    this._displayId = null;

    this._setDisplayId();
    this.logger.info(this, '[DISPLAY ID] ' + this._displayId);

    this.apiService.request(API_CMD.BFF_10_0001, {
      prodExpsTypCd: svcInfo.prodId !== this._prodId ? 'P' : 'SP'
    }, {}, this._prodId)
      .subscribe(( basicInfo ) => {
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            code: basicInfo.code,
            msg: basicInfo.msg,
            svcInfo: svcInfo,
            title: '가입'
          });
        }

        const displayGroup = this._getDisplayGroup(basicInfo.result.ctgCd);
        this.logger.info(this, '[DISPLAY GROUP] ' + displayGroup);

        if (FormatHelper.isEmpty(displayGroup)) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            title: '가입'
          });
        }

        // 모바일 요금제
        if (displayGroup === 'plans') {
          Observable.combineLatest(
            this.apiService.request(API_CMD.BFF_10_0008, {}, {}, this._prodId),
            this.apiService.request(API_CMD.BFF_10_0009, {})
          ).subscribe(([joinTermInfo, overPayReqInfo]) => {
            if (joinTermInfo.code !== API_CODE.CODE_00) {
              return this.error.render(res, {
                code: joinTermInfo.code,
                msg: joinTermInfo.msg,
                svcInfo: svcInfo,
                title: '가입'
              });
            }

            res.render('product.join.html', {
              joinTermInfo: this._convertPlansJoinTermInfo(joinTermInfo.result),
              svcInfo: svcInfo,
              pageInfo: pageInfo,
              prodId: this._prodId,
              prodNm: joinTermInfo.result.preinfo.toProdInfo.prodNm,
              displayId: this._displayId,
              displayGroup: displayGroup,
              ctgCd: basicInfo.result.ctgCd,
              isOverPayReq: overPayReqInfo.code === API_CODE.CODE_00,
              isApp: BrowserHelper.isApp(req),
              settingInfo: null
            });
          });
        }

        // 모바일 부가서비스
        if (displayGroup === 'additions') {
          this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, this._prodId)
            .subscribe((joinTermInfo) => {
              if (joinTermInfo.code !== API_CODE.CODE_00) {
                return this.error.render(res, {
                  code: joinTermInfo.code,
                  msg: joinTermInfo.msg,
                  svcInfo: svcInfo,
                  title: '가입'
                });
              }

              res.render('product.join.html', {
                joinTermInfo: this._convertAdditionsJoinTermInfo(joinTermInfo.result),
                svcInfo: svcInfo,
                pageInfo: pageInfo,
                prodId: this._prodId,
                prodNm: joinTermInfo.result.preinfo.reqProdInfo.prodNm,
                displayId: this._displayId,
                displayGroup: displayGroup,
                ctgCd: basicInfo.result.ctgCd,
                isApp: BrowserHelper.isApp(req),
                settingInfo: null
              });
            });
        }
      });
  }
}

export default ProductJoin;
