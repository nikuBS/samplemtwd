/**
 * @file product.roaming.my-use.controller.ts
 * @author Juho Kim (jhkim@pineone.com)
 * @since 2018.11.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { DATA_UNIT } from '../../../../types/string.type';

export default class ProductRoamingMyUse extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    Observable.combineLatest(
      this.getRoamingFeePlan(),
      this.getRoamingAdd(),
      this.getWirelessAdd(),
      this.getTroamingData(),
      this.getTroamingLikeHome()
    ).subscribe(([roamingFeePlan, roamingAdd, wirelessAdd, troamingData, troamingLikeHome]) => {

      const error = {
        code: roamingFeePlan.code || roamingAdd.code || wirelessAdd.code ||
          (troamingData && troamingData.code) || (troamingLikeHome && troamingLikeHome.code),
        msg: roamingFeePlan.msg || roamingAdd.msg || wirelessAdd.msg ||
          (troamingData && troamingData.msg) || (troamingLikeHome && troamingLikeHome.msg)
      };

      if (error.code) {
        return this.error.render(res, { ...error, svcInfo, pageInfo });
      }

      this.updateRemainedDays(roamingFeePlan, troamingData);

      res.render('roaming/product.roaming.my-use.html',
        { svcInfo, pageInfo, roamingFeePlan, roamingAdd , wirelessAdd, troamingData, troamingLikeHome});
    });
  }

  private updateRemainedDays(roamingFeePlan: any, troamingData: any) {
    roamingFeePlan.roamingProdList.forEach(prod => {
      prod.remainedDays = null;
      if ( troamingData && (prod.prodId === troamingData.prodId) ) {
        if ( !FormatHelper.isEmpty(troamingData.rgstDtm) ) {
          prod.remainedDays = DateHelper.getDiffByUnit(
            DateHelper.getCurrentShortDate(troamingData.exprDtm),
            DateHelper.getCurrentShortDate(),
            'days').toString();
        }
      }
    });
  }

  private getRoamingFeePlan(): Observable<any> {
    // return Observable.of(BFF_10_0056_mock)
    return this.apiService.request(API_CMD.BFF_10_0056, {})
      .map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        resp.result.roamingProdList = [];
        return resp.result;
      }

      return {
        ...resp.result,
        roamingProdList: resp.result.roamingProdList.map(prod => {
          return {
            ...prod,
            basFeeTxt: FormatHelper.getFeeContents(prod.basFeeTxt === '0' ? '무료' : prod.basFeeTxt),
            scrbDt: DateHelper.getShortDate(prod.scrbDt),
            btnList: prod.prodSetYn !== 'Y' ? [] : prod.btnList.filter(btn => btn.btnTypCd === 'SE')
          };
        })
      };
    });
  }

  private getRoamingAdd(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0057, {}).map((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        resp.result.roamingProdList = [];
        return resp.result;
      }

      return {
        ...resp.result,
        roamingProdList: resp.result.roamingProdList.map(prod => {
          return {
            ...prod,
            basFeeTxt: FormatHelper.getFeeContents(prod.basFeeTxt === '0' ? '무료' : prod.basFeeTxt),
            scrbDt: DateHelper.getShortDate(prod.scrbDt),
            btnList: prod.prodSetYn !== 'Y' ? [] : prod.btnList.filter(btn => btn.btnTypCd === 'SE')
          };
        })
      };
    });
  }

  /**
   * T로밍 도착알리미 가입 여부
   */
  private getWirelessAdd(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0040, {}, {}, ['NA00003200']).map( resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

  /**
   * 실시간 잔여량 - 로밍 데이터
   */
  private getTroamingData(): Observable<any> {
    // return Observable.of(BFF_05_0201_mock)
    return this.apiService.request(API_CMD.BFF_05_0201, {})
      .map(r => {
        const resp = FormatHelper.objectClone(r);
        if ( resp.code !== API_CODE.CODE_00 ) {
          switch ( resp.code ) {
            case 'BLN0012': // 가입상품 아님
            case 'BLN0007': // 조회내역 없음
              return null;
          }

          return {
            code: resp.code,
            msg: resp.msg
          };
        }

        if ( FormatHelper.isEmpty(resp.result) ) {
          return null;
        }

        return {
          ...resp.result,
          convTotal: FormatHelper.convDataFormat(resp.result.total, DATA_UNIT.MB),
          convUsed: FormatHelper.convDataFormat(resp.result.used, DATA_UNIT.MB),
          convRemained: FormatHelper.convDataFormat(resp.result.remained, DATA_UNIT.MB)
        };
    });
  }

  /**
   * 실시간 잔여량 - RLH
   */
  private getTroamingLikeHome(): Observable<any> {
    // return Observable.of(BFF_05_0202_mock)
    return this.apiService.request(API_CMD.BFF_05_0202, {})
      .map(resp => {
        if ( resp.code !== API_CODE.CODE_00 ) {
          switch ( resp.code ) {
            case 'BLN0012': // 조회대상 아님(미가입상품 또는 기간 아님)
            case 'BLN0007': // 조회내역 없음
              return [];
          }

          return {
            code: resp.code,
            msg: resp.msg
          };
        }

        if ( FormatHelper.isEmpty(resp.result) ) {
          return [];
        }

        resp.result.forEach(prod => {
          const conv = {
            convTotal: FormatHelper.convDataFormat(prod.total, DATA_UNIT.MB),
            convUsed: FormatHelper.convDataFormat(prod.used, DATA_UNIT.MB),
            convRemained: FormatHelper.convDataFormat(prod.remained, DATA_UNIT.MB)
          };
          Object.assign(prod, conv);
        });

        return resp.result;
      });
  }

}
