/**
 * FileName: myt-join.myplan.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CDNAME, SVC_CDGROUP } from '../../../../types/bff.type';
import { DATA_UNIT, MYT_FEEPLAN_BENEFIT, FEE_PLAN_TIP_TXT } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';

const FEE_PLAN_TIP = {
  M1: ['MS_05_tip_01'], // 휴대폰
  M2: ['MS_05_tip_02'], // 선불폰(PPS)
  M3: ['MS_05_tip_04'], // T pocket Fi
  M4: ['MS_05_tip_04'], // T Login
  M5: [], // T Wibro
  S1: ['MS_05_tip_03'], // 인터넷
  S2: ['MS_05_tip_03'], // IPTV
  S3: ['MS_05_tip_03'] // 집전화
};

class MyTJoinMyplan extends TwViewController {
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
        scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.M.D.'),
        btnList: this._convertBtnList(item.btnList, item.prodSetYn),
        dcStaDt: FormatHelper.isEmpty(item.dcStaDt) ? null : DateHelper.getShortDateWithFormat(item.dcStaDt, 'YYYY.M.D.'),
        dcEndDt: FormatHelper.isEmpty(item.dcEndDt) ? null : this._getDcEndDt(item.dcEndDt)
      });
    });
  }

  /**
   * @param dcEndDt
   * @private
   */
  private _getDcEndDt(dcEndDt: any): any {
    if (dcEndDt === '99991231') {
      return MYT_FEEPLAN_BENEFIT.ENDLESS;
    }

    return DateHelper.getShortDateWithFormat(dcEndDt, 'YYYY.M.D.');
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
    const isNumberBasFeeAmt = !isNaN(Number(wirePlan.basFeeAmt));

    return Object.assign(wirePlan, {
      basFeeAmt: isNumberBasFeeAmt && parseInt(wirePlan.basFeeAmt, 10) > 0 ? FormatHelper.addComma(wirePlan.basFeeAmt.toString()) : 0,
      isDisplayFeeAmt: (wirePlan.coClCd === 'T' && wirePlan.basFeeAmt > 0),
      svcScrbDt: DateHelper.getShortDateWithFormat(wirePlan.svcScrbDt, 'YYYY.M.D.'),
      dcBenefits: this._convertWireDcBenefits(wirePlan.dcBenefits)
    });
  }

  /**
   * @param dcBenefits
   * @private
   */
  private _convertWireDcBenefits(dcBenefits): any {
    const dcTypeMoneyList: any = [],
      dcTypePercentList: any = [];

    dcBenefits.forEach((item) => {
      if (item.dcCttClCd === '01') {
        dcTypeMoneyList.push(item);
        return true;
      }

      dcTypePercentList.push(item);
    });

    return [...this._sortByHigher(dcTypeMoneyList), ...this._sortByHigher(dcTypePercentList)]
      .map((item) => {
        return this._convertWireDcBenefitItem(item);
      });
  }

  /**
   * @param list
   * @private
   */
  private _sortByHigher(list: any): any {
    return list.sort((itemA, itemB) => {
      if (itemA.dcVal > itemB.dcVal) {
        return -1;
      }

      if (itemA.dcVal < itemB.dcVal) {
        return 1;
      }

      return 0;
    });
  }

  /**
   * @param dcBenefitItem
   * @private
   */
  private _convertWireDcBenefitItem(dcBenefitItem: any): any {
    return Object.assign(dcBenefitItem, {
      penText: (dcBenefitItem.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N,
      dcStaDt: DateHelper.getShortDateWithFormat(dcBenefitItem.dcStaDt, 'YYYY.M.D.'),
      dcEndDt: (dcBenefitItem.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(dcBenefitItem.dcEndDt, 'YYYY.M.D.')
        : MYT_FEEPLAN_BENEFIT.ENDLESS,
      dcVal: dcBenefitItem.dcCttClCd === '01' ? FormatHelper.addComma(dcBenefitItem.dcVal.toString()) : dcBenefitItem.dcVal
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
      basOfrVcallTmsCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrVcallTmsTxt),
      basOfrCharCntCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrLtrAmtTxt),
      disProdList = FormatHelper.getValidVars(wirelessPlan.disProdList, []);

    const basDataGbTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basDataGbTxt),
      basDataMbTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basDataMbTxt),
      basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

    const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

    return Object.assign(wirelessPlan, {
      feePlanProd: FormatHelper.isEmpty(wirelessPlan.feePlanProd) ? null : Object.assign(wirelessPlan.feePlanProd, {
        scrbDt: DateHelper.getShortDateWithFormat(wirelessPlan.feePlanProd.scrbDt, 'YYYY.M.D.'),
        basFeeInfo: spec.basFeeInfo,
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,
        basOfrCharCntCtt: spec.basOfrCharCntCtt,
        btnList: this._convertBtnList(wirelessPlan.feePlanProd.btnList, wirelessPlan.feePlanProd.prodSetYn)
      }),
      optionAndDiscountProgramList: this._convertOptionAndDiscountProgramList(disProdList)
    });
  }

  /**
   * @param basDataGbTxt
   * @param basDataMbTxt
   * @private
   */
  private _getBasDataTxt(basDataGbTxt: any, basDataMbTxt: any): any {
    if (!FormatHelper.isEmpty(basDataGbTxt)) {
      return {
        txt: basDataGbTxt,
        unit: DATA_UNIT.GB
      };
    }

    if (!FormatHelper.isEmpty(basDataMbTxt)) {
      return {
        txt: basDataMbTxt,
        unit: DATA_UNIT.MB
      };
    }

    return {
      txt: null,
      unit: null
    };
  }

  /**
   * @param svcAttrCd
   * @private
   */
  private _getTipList(svcAttrCd: any): any {
    if (FormatHelper.isEmpty(svcAttrCd)) {
      return [];
    }

    return FEE_PLAN_TIP[svcAttrCd].map((item) => {
      return {
        code: item,
        title: FEE_PLAN_TIP_TXT[item]
      };
    });
  }

  /**
   * @param btnList
   * @param prodSetYn
   * @private
   */
  private _convertBtnList(btnList: any, prodSetYn: any): any {
    if (FormatHelper.isEmpty(btnList)) {
      return [];
    }

    const settingBtnList: any = [];

    btnList.forEach((item) => {
      if (item.btnTypCd !== 'SE') {
        return true;
      }

      settingBtnList.push(item);
    });

    return settingBtnList;
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

        const feePlan = this._convertFeePlan(feePlanInfo, apiInfo.isWire),
          tipList = this._getTipList(svcInfo.svcAttrCd);

        if (FormatHelper.isEmpty(feePlan)) {
          return this.error.render(res, defaultOptions);
        }

        res.render('myplan/myt-join.myplan.html', {
          pageInfo: pageInfo,
          svcInfo: svcInfo,
          svcCdName: SVC_CDNAME,
          feeMainTemplate: apiInfo.isWire ? 'wire' : 'wireless',
          feePlan: feePlan,
          tipList: tipList,
          isFeeAlarm: ['cellphone', 'pps'].indexOf(SVC_CDNAME[svcInfo.svcAttrCd]) !== -1
        });
    });
  }
}

export default MyTJoinMyplan;
