import { COMBINATION_PRODUCT_OTHER_TYPE } from '../../../../types/bff.type';
/**
 * FileName: myt.join.product-service.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.13
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { SVC_CDNAME, SVC_CDGROUP } from '../../../../types/bff.type';
import { Combinations, Wire, WireLess } from '../../../../mock/server/myt.join.product-service.mock';
import { MYT_COMBINATION_TYPE, MYT_COMBINATION_FAMILY, MYT_FEEPLAN_BENEFIT } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

interface ICombination {
  prodId: string;  // 상품 코드
  prodNm: string;  // 상품명
  scrbDt: string;  // 가입 일자
  prodSmryDesc: string;  // 상품 요약 설명
  items: { icon: string; description: string; }[];
  hasDetail: boolean;
}

interface ICombinationList {
  [key: string]: ICombination;
}

class MytJoinProductServiceController extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param svcAttrCd
   * @private
   */
  private _getFeePlanApiInfo(svcAttrCd): any {
    if (SVC_CDGROUP.WIRELESS.indexOf(svcAttrCd) !== -1) {
      return {
        isWire: false,
        apiCmd: API_CMD.BFF_05_0136
      };
    }

    if (SVC_CDGROUP.WIRE.indexOf(svcAttrCd) !== -1) {
      return {
        isWire: true,
        apiCmd: API_CMD.BFF_05_0128
      };
    }

    return null;
  }

  /**
   * @param data
   * @param isWire
   * @private
   */
  private _convertFeePlan(data, isWire): Observable<any> {
    return Object.assign(data.result, (isWire) ? {
      basFeeAmt: data.result.basFeeAmt > 0 ? FormatHelper.addComma(data.result.basFeeAmt) : 0,
      isDisplayFeeAmt: (data.result.coClCd !== 'T' && data.result.basFeeAmt > 0),
      svcScrbDt: DateHelper.getShortDateWithFormat(data.result.svcScrbDt, 'YYYY.MM.DD'),
      dcBenefits: data.result.dcBenefits.map((item) => {
        return Object.assign(item, {
          penText: (item.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N,
          dcStaDt: DateHelper.getShortDateWithFormat(item.dcStaDt, 'YYYY.MM.DD'),
          dcEndDt: (item.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(item.dcEndDt, 'YYYY.MM.DD') : MYT_FEEPLAN_BENEFIT.ENDLESS,
          dcVal: FormatHelper.addComma(item.dcVal)
        });
      })
    } : {
      useFeePlanPro: Object.assign(data.result.useFeePlanPro, {
        scrbDt: DateHelper.getShortDateWithFormat(data.result.useFeePlanPro.scrbDt, 'YYYY.MM.DD'),
        basFeeTxt: FormatHelper.addComma(data.result.useFeePlanPro.basFeeTxt)
      }),
      tClassProd: Object.assign(data.result.tClassProd, {
        tClassProdList: data.result.tClassProd.tClassProdList.map((item) => {
          return Object.assign(item, {
            scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.MM.DD')
          });
        })
      })
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const apiInfo = this._getFeePlanApiInfo(svcInfo.svcAttrCd);

    if (FormatHelper.isEmpty(apiInfo)) {
      return this.error.render(res, {
        title: '나의 가입서비스',
        svcInfo: svcInfo
      });
    }

    const feePlanApi: Observable<any> = apiInfo.isWire ? Observable.of(Wire) : Observable.of(WireLess);
    // const feePlanApi: Observable<any> = this.apiService.request(apiInfo.apiCmd, {});

    Observable.combineLatest(
      feePlanApi,
      this.getCombinations()
    ).subscribe(([feePlan, combinations]) => {
      if (feePlan.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          title: '나의 가입서비스',
          code: feePlan.code,
          msg: feePlan.msg,
          svcInfo: svcInfo
        });
      }

      res.render('join/myt.join.product-service.html', {
        svcInfo: svcInfo,
        svcCdName: SVC_CDNAME,
        feePlan: this._convertFeePlan(feePlan, apiInfo.isWire),
        combinations
      });
    });
  }

  private getCombinations = (): Observable<ICombinationList> => {
    return this.apiService.request(API_CMD.BFF_05_0133, {}).map(
      (resp: {
        code: string,
        result: { combinationWireMemberList?: any[], combinationWirelessMemberList?: any[] }
      }) => {
        const combinations: ICombinationList = {};
        const wireless = resp.result.combinationWirelessMemberList;
        const wire = resp.result.combinationWireMemberList;

        if (wireless) {
          for (let i = 0; i < wireless.length; i++) {
            const item = wireless[i];
            combinations[item.expsOrder] = this.getProperCombination(item);
          }
        }

        if (wire) {
          for (let i = 0; i < wire.length; i++) {
            const item = wire[i];
            combinations[item.expsOrder] = this.getProperCombination(item);
          }
        }

        return combinations;
      });
  }

  private getProperCombination = (item: any): ICombination => {
    const nItem: ICombination = {
      prodId: item.prodId,
      prodNm: item.prodNm,
      scrbDt: DateHelper.getShortDateNoDot(item.scrbDt),
      prodSmryDesc: item.prodSmryDesc,
      items: [],
      hasDetail: COMBINATION_PRODUCT_OTHER_TYPE.indexOf(item.prodId) < 0  // 한가족 할인 or TB끼리 TV플러스 : false
    };

    switch (item.prodId) {
      case 'NA00005055':    // 가족나눔데이터
      case 'NA00002040':
      case 'TW20000010':    // T끼리온가족할인제도
      case 'NA00004728':
      case 'TW20000011':    // 온가족 행복플랜
      case 'NA00004211': {  // T가족결합(착한가족)
        nItem.items.push({
          icon: 'line',
          description: MYT_COMBINATION_TYPE.LINE
        }, {
            icon: 'multi',
            description: MYT_COMBINATION_TYPE.MULTI_ONE
          });
        break;
      }

      case 'TW00000062': {
        nItem.items.push({
          icon: 'line',
          description: MYT_COMBINATION_TYPE.LINE
        }, {
            icon: 'int',
            description: MYT_COMBINATION_TYPE.INTERNET
          });
        break;
      }

      case 'TW00000063': {
        nItem.items.push({
          icon: 'line',
          description: MYT_COMBINATION_TYPE.LINE
        }, {
            icon: 'tel',
            description: MYT_COMBINATION_TYPE.TEL
          });
        break;
      }

      case 'NH00000084':
      case 'TW20000008': {  // TB끼리 온가족프리
        nItem.items.push({
          icon: 'multi',
          description: MYT_COMBINATION_TYPE.MULTI_TWO
        }, {
            icon: 'int',
            description: MYT_COMBINATION_TYPE.INTERNET
          });
        break;
      }

      case 'NH00000059':
      case 'TW20000007': {  // TB끼리 온가족무료
        nItem.items.push({
          icon: 'line',
          description: MYT_COMBINATION_TYPE.FAMILY
        }, {
            icon: 'tel',
            description: MYT_COMBINATION_TYPE.TEL
          }, {
            icon: 'itel',
            description: MYT_COMBINATION_TYPE.ITEL
          });
        break;
      }

      case 'NH00000037':
      case 'NH00000039':
      case 'TW00000062': {  // T+B인터넷
        if (item.prodNm.includes(MYT_COMBINATION_FAMILY)) {
          nItem.items.push({
            icon: 'line',
            description: MYT_COMBINATION_TYPE.FAMILY
          });
        } else {
          nItem.items.push({
            icon: 'line',
            description: MYT_COMBINATION_TYPE.LINE
          });
        }
        nItem.items.push({
          icon: 'int',
          description: MYT_COMBINATION_TYPE.INTERNET
        });
        break;
      }

      case 'NH00000040':
      case 'NH00000041':
      case 'TW00000063': {  // T+B인터넷
        if (item.prodNm.includes(MYT_COMBINATION_FAMILY)) {
          nItem.items.push({
            icon: 'line',
            description: MYT_COMBINATION_TYPE.FAMILY
          });
        } else {
          nItem.items.push({
            icon: 'line',
            description: MYT_COMBINATION_TYPE.LINE
          });
        }
        nItem.items.push({
          icon: 'tel',
          description: MYT_COMBINATION_TYPE.TEL
        }, {
            icon: 'itel',
            description: MYT_COMBINATION_TYPE.ITEL
          });
        break;
      }
    }

    return nItem;
  }
}


export default MytJoinProductServiceController;
