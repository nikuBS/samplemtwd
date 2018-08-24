/**
 * FileName: myt.join.product-service.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.13
 */

import { COMBINATION_PRODUCT_OTHER_TYPE, UNIT, VOICE_UNIT } from '../../../../types/bff.type';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { SVC_CDNAME, SVC_CDGROUP } from '../../../../types/bff.type';
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
   * @param data
   * @param isWire
   * @private
   */
  private _convertFeePlan(data, isWire): Observable<any> {
    if ( isWire ) {
      return Object.assign(data.result, {
        basFeeAmt: data.result.basFeeAmt > 0 ? FormatHelper.addComma(data.result.basFeeAmt) : 0,
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
          : FormatHelper.addComma(data.result.feePlanProd.basFeeTxt) + UNIT['110'],
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
      }
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const apiInfo = this._getFeePlanApiInfo(svcInfo.svcAttrCd),
      defaultOptions = {
        title: '나의 가입서비스',
        svcInfo: svcInfo
      };

    if ( FormatHelper.isEmpty(apiInfo) ) {
      return this.error.render(res, defaultOptions);
    }

    Observable.combineLatest(
      this.apiService.request(apiInfo.apiCmd, {}),
      this.getCombinations(),
      this.getAddictions(svcInfo)
    ).subscribe(([feePlan, combinations, additions]) => {
      if ( feePlan.code !== API_CODE.CODE_00 ) {
        return this.error.render(res, Object.assign(defaultOptions, {
          code: feePlan.code,
          msg: feePlan.msg
        }));
      }

      res.render('join/myt.join.product-service.html', {
        svcInfo: svcInfo,
        svcCdName: SVC_CDNAME,
        feeMainTemplate: apiInfo.isWire ? 'wire' : 'wireless',
        feePlan: this._convertFeePlan(feePlan, apiInfo.isWire),
        combinations,
        additions: this.convertAddtions()
      });
    });
  }

  private getCombinations = (): Observable<ICombinationList | null> => {
    return this.apiService.request(API_CMD.BFF_05_0133, {}).map(
      (resp: {
        code: string,
        result: { combinationWireMemberList?: any[], combinationWirelessMemberList?: any[] }
      }) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const combinations: ICombinationList = {};
          const wireless = resp.result.combinationWirelessMemberList;
          const wire = resp.result.combinationWireMemberList;

          if ( wireless && wireless.length > 0 ) {
            for ( let i = 0; i < wireless.length; i++ ) {
              const item = wireless[i];
              const nItem = this.getProperCombination(item);
              if ( nItem ) {
                combinations[item.expsOrder] = nItem;
              }
            }
          } else {
            return null;
          }

          if ( wire ) {
            for ( let i = 0; i < wire.length; i++ ) {
              const item = wire[i];
              const nItem = this.getProperCombination(item);

              if ( nItem ) {
                combinations[item.expsOrder] = nItem;
              }
            }
          }

          return combinations;
        }
        return null;
      });
  }

  private getProperCombination = (item: any): ICombination | null => {
    const nItem: ICombination = {
      prodId: item.prodId,
      prodNm: item.prodNm,
      scrbDt: DateHelper.getShortDateNoDot(item.scrbDt),
      prodSmryDesc: item.prodSmryDesc,
      items: [],
      hasDetail: COMBINATION_PRODUCT_OTHER_TYPE.indexOf(item.prodId) < 0  // 한가족 할인 or TB끼리 TV플러스 : false
    };

    switch ( item.prodId ) {
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
        if ( item.prodNm.includes(MYT_COMBINATION_FAMILY) ) {
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
        if ( item.prodNm.includes(MYT_COMBINATION_FAMILY) ) {
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
      case 'NH00000105':
      case 'TW00000016': {  // TB끼리 TV플러스
        nItem.items.push({
          icon: 'multi',
          description: MYT_COMBINATION_TYPE.MULTI_TWO
        }, {
          icon: 'iptv',
          description: MYT_COMBINATION_TYPE.IPTV
        });
        break;
      }
      case 'NH00000103':
      case 'TW00000009': {  // 한가족할인
        nItem.items.push({
          icon: 'line',
          description: MYT_COMBINATION_TYPE.LINE
        }, {
          icon: 'int',
          description: MYT_COMBINATION_TYPE.INTERNET
        });
        break;
      }
      default: {
        return null;
      }
    }

    return nItem;
  }

  private getAddictions = (svcInfo): Observable<any> => {
    if ( svcInfo.svcAttrCd.indexOf('M') === 0 ) {
      return this.apiService.request(API_CMD.BFF_05_0137, {});
    } else {
      return this.apiService.request(API_CMD.BFF_05_0129, {});
    }
  }

  private convertAddtions = () => {
    // const additions_s = {
    //   'code': '00',
    //   'msg': '',
    //   'result': {
    //     'reserveds': [
    //       {
    //         'prodId': 'NI00000266',
    //         'prodNm': 'T_PC원스톱',
    //         'payFreeYn': 'N',
    //         'basFeeAmt': 3300,
    //         'prodLinkYn': 'Y',
    //         'scrbDt': '20171107'
    //       }
    //     ],
    //     'pays': [
    //       {
    //         'prodId': 'NI00000266',
    //         'prodNm': 'T_PC원스톱',
    //         'payFreeYn': 'N',
    //         'basFeeAmt': 3300,
    //         'prodLinkYn': 'Y',
    //         'scrbDt': '20171107'
    //       }
    //     ],
    //     'frees': [
    //       {
    //         'prodId': 'NI00000266',
    //         'prodNm': 'T_PC원스톱',
    //         'payFreeYn': 'N',
    //         'basFeeAmt': 3300,
    //         'prodLinkYn': 'Y',
    //         'scrbDt': '20171107'
    //       }
    //     ],
    //
    //     'joinables': [
    //       {
    //         'prodId': 'NI00000258',
    //         'prodNm': 'T_가디언SW',
    //         'payFreeYn': 'N',
    //         'basFeeAmt': 0,
    //         'prodLinkYn': 'Y'
    //       },
    //       {
    //         'prodId': 'NI00000259',
    //         'prodNm': 'T_파워IP',
    //         'payFreeYn': 'N',
    //         'basFeeAmt': 38500,
    //         'prodLinkYn': 'Y'
    //       }
    //     ]
    //
    //   }
    // };

    const additions = {
      'code': '00',
      'msg': '',
      'result': {
        'addSvcProdList': [
          {
            'prodId': 'NA00004073',
            'prodNm': '넘버플러스II',
            'basFeeTxt': '3850',
            'scrbDt': '20170915',
            'goDetailUrl': '',
            'goSetUrl': '/normal.do?serviceId=S_ADD_0071&viewId=V_CENT1025&prod_id=NA00004073',
            'goTermUrl': '',
            'payFreeYn': 'N'
          },
          {
            'prodId': 'NA00004196',
            'prodNm': 'T안심콜 라이트',
            'basFeeTxt': '8000',
            'scrbDt': '20140120',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'N'
          }
        ], 'disProdList': [
          {
            'prodId': 'NA00004430',
            'prodNm': '요금약정할인제도',
            'scrbDt': '20161024',
            'prodDesc': '특정 요금제를 일정 기간 이용하는 고객에게 매월 요금 할인을 제공하는 제도',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'Y'
          },
          {
            'prodId': 'NA00004196',
            'prodNm': '함께쓰기 그룹(모)',
            'scrbDt': '20140120',
            'prodDesc': '이동전화 모회선 데이터 공유',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'N'
          }
        ],
        'optProdList': [
          {
            'prodId': 'NA00004430',
            'prodNm': '선택약정할인제도',
            'basFeeTxt': '상세참조',
            'scrbDt': '20161024',
            'prodDesc': '단말 지원금 미선택 고객에게 요금할인 혜택 제공',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'Y'
          }
        ],
        'roamingProdList': [
          {
            'prodId': 'NA00004863',
            'prodNm': 'T로밍 함께쓰기 3GB',
            'basFeeTxt': '무료, 상세참조, 1,000원',
            'scrbDt': '20130225',
            'prodDesc': '스마트폰 도난,분실, 파손 고객에게 단말기 보상 지원금 혜택을 제공하는 보험연계상품',
            'prodDispYn': 'Y',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'Y'
          },
          {
            'prodId': 'NA00004707',
            'prodNm': 'T로밍 함께쓰기 10GB',
            'basFeeTxt': '무료, 상세참조, 1,000원',
            'scrbDt': '20130225',
            'prodDesc': '요금약정할인 금액의 최대 120%를 적립할 수 있는 Okcashbag 상품',
            'prodDispYn': 'Y',
            'goDetailUrl': '',
            'goSetUrl': '',
            'goTermUrl': '',
            'payFreeYn': 'Y'
          }
        ]
      }
    };

    const result = additions.result;

    Object.keys(result).forEach(key => {
      result[key] = result[key].map((product) => {
        result['paidCount'] = 0;
        result['freeCount'] = 0;

        if ( product.payFreeYn === 'Y' ) {
          result['freeCount'] = result['freeCount'] + 1;
        } else {
          result['paidCount'] = result['paidCount'] + 1;
        }

        return Object.assign(product, {
          scrbDt: DateHelper.getShortDateNoDot(product.scrbDt),
          basFeeTxt: product.basFeeTxt ? isNaN(parseInt(product.basFeeTxt.toString(), 10)) ?
            product.basFeeTxt.toString() : FormatHelper.addComma(product.basFeeTxt.toString()) : '',
          basFeeAmt: product.basFeeAmt ? isNaN(parseInt(product.basFeeAmt.toString(), 10)) ?
            product.basFeeAmt.toString() : FormatHelper.addComma(product.basFeeAmt.toString()) : '',
          isBasFeeNumber: isNaN(parseInt(product.basFeeTxt, 10))
        });
      });
    });

    return result;
  }
}

export default MytJoinProductServiceController;
