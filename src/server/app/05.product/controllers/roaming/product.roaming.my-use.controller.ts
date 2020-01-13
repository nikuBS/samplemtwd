/**
 * 나의 T로밍 이용현황 화면 처리
 * @author Juho Kim
 * @since 2018-11-20
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

      // 사용자가 T괌사이판 국내처럼 로밍 상품에 가입하지 않은경우 troamingLikeHome에 데이터가 들어가지 않음
      if (troamingLikeHome.length > 0) {
        this.updateRemainedDays(roamingFeePlan, troamingLikeHome[0], true);
      } else {
      this.updateRemainedDays(roamingFeePlan, troamingData, false);
      }

      res.render('roaming/product.roaming.my-use.html',
        { svcInfo, pageInfo, roamingFeePlan, roamingAdd , wirelessAdd, troamingData, troamingLikeHome});
    });
  }

  /**
   * 로밍 잔여일 업데이트
   * @param roamingFeePlan 로밍 요금제 (SWING 정보 사용)
   * @param troamingData 로밍 데이터 (ICAS 정보 사용)
   * @param isTroamingLikeHome troamingData가 troamingLikeHome 인지 여부
   */
  private updateRemainedDays(roamingFeePlan: any, troamingData: any, isTroamingLikeHome: boolean) {

    // T괌사이판 국내처럼 일때 이용중인 T로밍 잔여기간에 대한 계산은 BFF_05_0202 의 리스트중 하나의 항목에 대한 rgstDtm 와 exprDtm를 사용
    // (리스트 모든 항목의 rgstDtm와 exprDtm의 날짜는 T괌사이판 국내처럼의 값으로 모두 동일하게 셋팅됨)
    // 리스트 output은 prodId 및 prodNm은 T괌사이판 국내처럼이 들어가지 않음
    roamingFeePlan.roamingProdList.forEach(prod => {
      prod.remainedDays = null;
      if (isTroamingLikeHome) { // T괌사이판 국내처럼 일때
        if ( !FormatHelper.isEmpty(troamingData.rgstDtm) ) {
          prod.remainedDays = DateHelper.getDiffByUnit(
            DateHelper.getCurrentShortDate(troamingData.exprDtm),
            DateHelper.getCurrentShortDate(),
            'days').toString();
        }
      } else {
        if ( troamingData && (prod.prodId === troamingData.prodId) ) {
          if ( !FormatHelper.isEmpty(troamingData.rgstDtm) ) {
            prod.remainedDays = DateHelper.getDiffByUnit(
                DateHelper.getCurrentShortDate(troamingData.exprDtm),
                DateHelper.getCurrentShortDate(),
                'days').toString();
          }
        }
      }
    });
  }

  /**
   * 나의 로밍 이용현황 (로밍 요금제) 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 에러코드 반환
   */
  private getRoamingFeePlan(): Observable<any> {
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

  /**
   * 나의 로밍 이용현황 (로밍 부가서비스) 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 에러코드 반환
   */
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
   * T로밍 도착알리미 가입 여부 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 에러코드 반환
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
   * 실시간 잔여량 (로밍 데이터) 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 에러코드 반환
   */
  private getTroamingData(): Observable<any> {
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
   * 실시간 잔여량 (RLH - Romaing Like Home) 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 에러코드 반환
   */
  private getTroamingLikeHome(): Observable<any> {
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
