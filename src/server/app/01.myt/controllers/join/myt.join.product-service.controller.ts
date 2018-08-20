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
import { MYT_COMBINATION_TYPE } from '../../../../types/string.type';

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

  private _additionsInfo: any;
  private _combinationsInfo: any;

  /**
   * @param svcAttrCd
   * @private
   */
  private _getFeePlanApiCode(svcAttrCd): any {
    if (SVC_CDGROUP.WIRELESS.indexOf(svcAttrCd) !== -1) {
      return API_CMD.BFF_05_0136;
    }

    if (SVC_CDGROUP.WIRE.indexOf(svcAttrCd) !== -1) {
      return API_CMD.BFF_05_0128;
    }

    return null;
  }

  /**
   * @todo
   * @param svcAttrCd
   * @private
   */
  private _getFeePlanApiResponse(svcAttrCd): any {
    const apiCode = this._getFeePlanApiCode(svcAttrCd);
    if (FormatHelper.isEmpty(apiCode)) {
      return null;
    }

    return this.apiService.request(apiCode, {}, {});
  }

  /**
   * @todo mockData
   * @private
   */
  private _getFeePlanMockResponse(isWire): Observable<any> {
    return isWire ? Observable.of(Wire) : Observable.of(WireLess);
  }

  /**
   * @param code
   * @private
   */
  private _isSuccess(code): any {
    return API_CODE.CODE_00 === code;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const thisMain = this,
        feePlanApi = this._getFeePlanMockResponse(true),
        feePlanApiLiveTest = this._getFeePlanApiResponse(svcInfo.svcAttrCd);

    // @todo remove feePlanApiLiveTest
    // feePlanApiLiveTest.subscribe((data) => {
    //   console.log(data);
    // });

    // @todo svcAttrCd Empty 일때 처리
    if (FormatHelper.isEmpty(feePlanApi)) {
      return this.error.render(res, {
        title: '나의 가입서비스',
        svcInfo: svcInfo
      });
    }

    feePlanApi.subscribe((data) => {
      if (!this._isSuccess(data.code)) {
        return this.error.render(res, {
          title: '나의 가입서비스',
          code: data.code,
          msg: data.msg,
          svcInfo: svcInfo
        });
      }

      const additionsApi: Observable<any> = Observable.of({
        code: '00',
        result: {}
      });
      // const combinationsApi: Observable<any> = this.apiService.request(API_CMD.BFF_05_0128, {}, {});
      const combinations: ICombinationList = Combinations;

      Observable.combineLatest(
          additionsApi
      ).subscribe({
        next([
         additions
       ]) {
          thisMain._additionsInfo = thisMain._isSuccess(additions.code) ? additions.result : null;
          // thisMain._combinationsInfo = thisMain._isSuccess(combinations.code) ? combinations.result : null;
        },
        complete() {
          res.render('join/myt.join.product-service.html', {
            svcInfo: svcInfo,
            svcCdName: SVC_CDNAME,
            feePlan: null,
            combinations
          });
        }
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
      scrbDt: item.scrbDt,
      prodSmryDesc: item.prodSmryDesc,
      items: [],
      hasDetail: true  // 한가족 할인 or TB끼리 TV플러스 : false
    };

    switch (item.prodId) {
      case 'TW20000010':   // T끼리온가족할인제도
      case 'NA00004211': { // T가족결합(착한가족)
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
    }

    return nItem;
  }
}

export default MytJoinProductServiceController;
