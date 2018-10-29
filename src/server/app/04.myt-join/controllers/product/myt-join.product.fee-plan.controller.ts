/**
 * FileName: myt-join.product.fee-plan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CDNAME, SVC_CDGROUP, UNIT, VOICE_UNIT } from '../../../../types/bff.type';
import { MYT_FEEPLAN_BENEFIT } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinProductFeePlan extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param svcAttrCd
   * @private
   */
  private _getFeePlanApiInfo(svcAttrCd): any {
    if ( SVC_CDGROUP.WIRELESS.indexOf(svcAttrCd) !== -1 ) {
      return {
        isWire: false,
        apiCmd: API_CMD.BFF_05_0136
      };
    }

    if ( SVC_CDGROUP.WIRE.indexOf(svcAttrCd) !== -1 ) {
      return {
        isWire: true,
        apiCmd: API_CMD.BFF_05_0128
      };
    }

    return null;
  }

  /**
   * @param optionAndDiscountProgramList
   * @private
   */
  private _convertOptionAndDiscountProgramList(optionAndDiscountProgramList): any {
    return optionAndDiscountProgramList.map((item) => {
      return Object.assign(item, {
        scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.MM.DD')
      });
    });
  }

  /**
   * @param data
   * @param isWire
   * @private
   */
  private _convertFeePlan(data, isWire): any {
    return isWire ? this._convertWirePlan(data.result) : this._convertWirelessPlan(data.result);
  }

  /**
   * @param wirePlan
   * @private
   */
  private _convertWirePlan(wirePlan): any {
    return Object.assign(wirePlan, {
      basFeeAmt: wirePlan.basFeeAmt > 0 ? FormatHelper.addComma(wirePlan.basFeeAmt.toString()) : 0,
      isDisplayFeeAmt: (wirePlan.coClCd === 'T' && wirePlan.basFeeAmt > 0),
      svcScrbDt: DateHelper.getShortDateWithFormat(wirePlan.svcScrbDt, 'YYYY.MM.DD'),
      dcBenefits: this._convertWireDcBenefits(wirePlan.dcBenefits),
      optionFeePlans: this._convertWireOptionFeePlans(wirePlan.optionFeePlans)
    });
  }

  /**
   * @param optionFeePlans
   * @private
   */
  private _convertWireOptionFeePlans(optionFeePlans): any {
    return optionFeePlans.map((item) => {
      return Object.assign(item, {
        scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.MM.DD')
      });
    });
  }

  /**
   * @param dcBenefits
   * @private
   */
  private _convertWireDcBenefits(dcBenefits): any {
    return dcBenefits.map((item) => {
      return Object.assign(item, {
        penText: (item.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N,
        dcStaDt: DateHelper.getShortDateWithFormat(item.dcStaDt, 'YYYY.MM.DD'),
        dcEndDt: (item.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(item.dcEndDt, 'YYYY.MM.DD')
            : MYT_FEEPLAN_BENEFIT.ENDLESS,
        dcVal: FormatHelper.addComma(item.dcVal.toString())
      });
    });
  }

  /**
   * @param wirelessPlan
   * @private
   */
  private _convertWirelessPlan(wirelessPlan): any {
    if (FormatHelper.isEmpty(wirelessPlan.feePlanProd)) {
      return null;
    }

    const basFeeTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basFeeTxt),
      basOfrDataQtyCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basDataTxt),
      basOfrVcallTmsCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrVcallTmsTxt),
      basOfrCharCntCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrLtrAmtTxt),
      disProdList = FormatHelper.getValidVars(wirelessPlan.disProdList, []),
      optProdList = FormatHelper.getValidVars(wirelessPlan.optProdList, []),
      comProdList = FormatHelper.getValidVars(wirelessPlan.comProdList, []),
      spec = FormatHelper.convProductSpecifications(basFeeTxt, basOfrDataQtyCtt, basOfrVcallTmsCtt, basOfrCharCntCtt);

    return Object.assign(wirelessPlan, {
      feePlanProd: FormatHelper.isEmpty(wirelessPlan.feePlanProd) ? null : Object.assign(wirelessPlan.feePlanProd, {
        scrbDt: DateHelper.getShortDateWithFormat(wirelessPlan.feePlanProd.scrbDt, 'YYYY.MM.DD'),
        basFeeInfo: spec.basFeeInfo,
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,
        basOfrCharCntCtt: spec.basOfrCharCntCtt
      }),
      optionAndDiscountProgramList: this._convertOptionAndDiscountProgramList([...disProdList, ...optProdList, ...comProdList])
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const defaultOptions = {
      title: '나의 요금제',
      svcInfo: svcInfo
    };

    if (FormatHelper.isEmpty(svcInfo.svcAttrCd)) {
      return this.error.render(res, defaultOptions);
    }

    const apiInfo = this._getFeePlanApiInfo(svcInfo.svcAttrCd);
    if ( FormatHelper.isEmpty(apiInfo) ) {
      return this.error.render(res, defaultOptions);
    }

    this.apiService.request(apiInfo.apiCmd, {})
      .subscribe(( feePlanInfo ) => {
        if ( feePlanInfo.code !== API_CODE.CODE_00 ) {
          return this.error.render(res, Object.assign(defaultOptions, {
            code: feePlanInfo.code,
            msg: feePlanInfo.msg
          }));
        }

        const feePlan = this._convertFeePlan(feePlanInfo, apiInfo.isWire);
        if (FormatHelper.isEmpty(feePlan)) {
          return this.error.render(res, defaultOptions);
        }

        res.render('product/myt-join.product.fee-plan.html', {
          pageInfo: pageInfo,
          svcInfo: svcInfo,
          svcCdName: SVC_CDNAME,
          feeMainTemplate: apiInfo.isWire ? 'wire' : 'wireless',
          feePlan: feePlan,
          isFeeAlarm: ['cellphone', 'pps'].indexOf(SVC_CDNAME[svcInfo.svcAttrCd]) !== -1
        });
    });
  }
}

export default MyTJoinProductFeePlan;
