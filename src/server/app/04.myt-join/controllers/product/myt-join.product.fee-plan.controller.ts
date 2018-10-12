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
  private _convertFeePlan(data, isWire): Observable<any> {
    if ( isWire ) {
      return Object.assign(data.result, {
        basFeeAmt: data.result.basFeeAmt > 0 ? FormatHelper.addComma(data.result.basFeeAmt.toString()) : 0,
        isDisplayFeeAmt: (data.result.coClCd !== 'T' && data.result.basFeeAmt > 0),
        svcScrbDt: DateHelper.getShortDateWithFormat(data.result.svcScrbDt, 'YYYY.MM.DD'),
        dcBenefits: data.result.dcBenefits.map((item) => {
          return Object.assign(item, {
            penText: (item.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N,
            dcStaDt: DateHelper.getShortDateWithFormat(item.dcStaDt, 'YYYY.MM.DD'),
            dcEndDt: (item.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(item.dcEndDt, 'YYYY.MM.DD')
                : MYT_FEEPLAN_BENEFIT.ENDLESS,
            dcVal: FormatHelper.addComma(item.dcVal.toString())
          });
        })
      });
    }

    return Object.assign(data.result, {
      feePlanProd: Object.assign(data.result.feePlanProd, {
        scrbDt: DateHelper.getShortDateWithFormat(data.result.feePlanProd.scrbDt, 'YYYY.MM.DD'),
        basFeeTxt: isNaN(parseInt(data.result.feePlanProd.basFeeTxt, 10)) ? data.result.feePlanProd.basFeeTxt
            : FormatHelper.addComma(data.result.feePlanProd.basFeeTxt),
        isBasFeeTxtUnit: !isNaN(parseInt(data.result.feePlanProd.basFeeTxt, 10)),
        basOfrVcallTmsTxt: (data.result.feePlanProd.basOfrVcallTmsTxt !== '0' + VOICE_UNIT.MIN) ? data.result.feePlanProd.basOfrVcallTmsTxt : null,
        basOfrLtrAmtTxt: (data.result.feePlanProd.basOfrLtrAmtTxt !== '0' + UNIT['310']) ? data.result.feePlanProd.basOfrLtrAmtTxt : null
      }),
      tClassProd: {
        tClassProdList: data.result.tClassProd && data.result.tClassProd.tClassProdList
            ? Object.assign(data.result.tClassProd.tClassProdList, {
              tClassProdList: data.result.tClassProd.tClassProdList.map((item) => {
                return Object.assign(item, {
                  scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.MM.DD')
                });
              })
            }) : []
      },
      optionAndDiscountProgramList: this._convertOptionAndDiscountProgramList([...data.result.disProdList,
        ...data.result.optProdList, ...data.result.comProdList])
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const apiInfo = this._getFeePlanApiInfo(svcInfo.svcAttrCd),
        defaultOptions = {
          title: '나의 요금제',
          svcInfo: svcInfo
        };

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

        res.render('product/myt-join.product.fee-plan.html', {
          svcInfo: svcInfo,
          svcCdName: SVC_CDNAME,
          feeMainTemplate: apiInfo.isWire ? 'wire' : 'wireless',
          feePlan: this._convertFeePlan(feePlanInfo, apiInfo.isWire),
          isFeeAlarm: ['cellphone', 'pps'].indexOf(SVC_CDNAME[svcInfo.svcAttrCd]) !== -1
        });
    });
  }
}

export default MyTJoinProductFeePlan;
