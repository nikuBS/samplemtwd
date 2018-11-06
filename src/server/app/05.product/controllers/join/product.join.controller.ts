/**
 * 상품 가입 (공통)
 * FileName: product.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { PRODUCT_SETTING, PRODUCT_JOIN } from '../../../../mock/server/product.display-ids.mock';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { PROD_CTG_CD_CODE, UNIT } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';
import ProductHelper from '../../helper/product.helper';

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
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
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
   * @param preInfo
   * @private
   */
  private _convertPlanPreInfo(preInfo): any {
    return Object.assign(preInfo, {
      frProdInfo: Object.assign(preInfo.frProdInfo, ProductHelper.convProductSpecifications(preInfo.frProdInfo.basFeeInfo,
          preInfo.frProdInfo.basOfrDataQtyCtt, preInfo.frProdInfo.basOfrVcallTmsCtt, preInfo.frProdInfo.basOfrCharCntCtt)),
      toProdInfo: Object.assign(preInfo.toProdInfo, ProductHelper.convProductSpecifications(preInfo.toProdInfo.basFeeInfo,
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
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
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

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {
        prodExpsTypCd: svcInfo.prodId !== this._prodId ? 'P' : 'SP'
      }, {}, this._prodId),
      this.redisService.getData('ProductLedger:' + this._prodId)
    ).subscribe(([ basicInfo, prodRedisInfo ]) => {
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

        if (FormatHelper.isEmpty(displayGroup) || FormatHelper.isEmpty(prodRedisInfo)) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            title: '가입'
          });
        }

        const renderOptions = {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          prodId: this._prodId,
          prodNm: prodRedisInfo.summary.prodNm,
          sktProdBenfCtt: prodRedisInfo.summary.sktProdBenfCtt,
          displayId: this._displayId,
          displayGroup: displayGroup,
          ctgCd: basicInfo.result.ctgCd,
          isApp: BrowserHelper.isApp(req),
          settingInfo: null
        };

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

            res.render('product.join.html', Object.assign(renderOptions, {
              joinTermInfo: this._convertPlansJoinTermInfo(joinTermInfo.result),
              isOverPayReq: overPayReqInfo.code === API_CODE.CODE_00
            }));
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

              res.render('product.join.html', Object.assign(renderOptions, {
                joinTermInfo: this._convertAdditionsJoinTermInfo(joinTermInfo.result)
              }));
            });
        }

        if (displayGroup === 'combine' && this._prodId === 'NA00004430') {
          this.apiService.request(API_CMD.BFF_10_0062, {}, {}, this._prodId)
            .subscribe((seldisSetsInfo) => {
              if (seldisSetsInfo.code !== API_CODE.CODE_00) {
                return this.error.render(res, {
                  code: seldisSetsInfo.code,
                  msg: seldisSetsInfo.msg,
                  svcInfo: svcInfo,
                  title: '가입'
                });
              }

              res.render('product.join.html', Object.assign(renderOptions, {
                seldisSets: Object.assign(seldisSetsInfo.result, {
                  noContractPlanPoint: FormatHelper.isEmpty(seldisSetsInfo.result.noContractPlanPoint) ?
                    0 : FormatHelper.addComma(seldisSetsInfo.result.noContractPlanPoint)
                })
              }));
            });
        }
      });
  }
}

export default ProductJoin;
