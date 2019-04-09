/**
 * T로밍 서브메인 화면 처리
 * @author Juho Kim
 * @since 2018-11-20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { REDIS_KEY } from '../../../../types/redis.type';

export default class ProductRoaming extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( this.isLogin(svcInfo) ) {
      this.renderLogin(res, svcInfo, pageInfo);
    } else {
      this.renderLogout(res, svcInfo, pageInfo);
    }
  }

  /**
   * 미로그인 상태에서 render 실행
   * @param res Response 객체
   * @param svcInfo 서비스 정보
   * @param pageInfo 페이지 정보
   */
  private renderLogout(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getBanners(pageInfo),
      this.getSprateProds()
    ).subscribe(([banners, sprateProds]) => {

      res.render('roaming/product.roaming.html', {
        svcInfo,
        pageInfo,
        isLogin: this.isLogin(svcInfo),
        banners,
        sprateProds
      });
    });
  }

  /**
   * 로그인 상태에서 render 실행
   * @param res Response 객체
   * @param svcInfo 서비스 정보
   * @param pageInfo 페이지 정보
   */
  private renderLogin(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getRoamingCount(),
      this.getBanners(pageInfo),
      this.getSprateProds()
    ).subscribe(([roamingCount, banners, sprateProds]) => {

      res.render('roaming/product.roaming.html', {
        svcInfo,
        pageInfo,
        isLogin: this.isLogin(svcInfo),
        roamingCount,
        banners,
        sprateProds
      });
    });
  }

  /**
   * 로그인 여부 확인
   * @param svcInfo 서비스 정보
   * @returns 로그인 상태면 true로 반환
   */
  private isLogin(svcInfo: any): boolean {
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return false;
    }
    return true;
  }

  /**
   * 나의 로밍 요금제 정보 영역 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 null 반환
   */
  private getRoamingCount(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0055, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        // 부분 차단
        return null;
      }

      return resp.result;
    });
  }

  /**
   * 배너조회
   * @param pageInfo 페이지정보
   * @returns 성공 시 result에 상단, 중단 배너를 분류한 프로퍼티를 추가하여 반한하고, 실패 시 null 반환
   */
  private getBanners(pageInfo): Observable<any> {
    return this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId).map((resp) => {
      if ( resp.code !== API_CODE.REDIS_SUCCESS ) {
        // 부분 차단
        return null;
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      resp.result.topBanners = resp.result.banners.filter(function (banner) {
        return banner.bnnrLocCd === 'T';
      });
      resp.result.centerBanners = resp.result.banners.filter(function (banner) {
        return banner.bnnrLocCd === 'C';
      });

      resp.result.topBanners.sort(function (a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });
      resp.result.centerBanners.sort(function (a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });

      return resp.result;
    });
  }

  /**
   * 로밍 개별상품 조회
   * @returns 성공 시 result 값을 반환하고, 실패 시 null 반환
   */
  private getSprateProds(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0123, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        // 부분 차단
        return null;
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      resp.result.prodList.map(prod => {
        prod.basFeeInfo = FormatHelper.numberWithCommas(Number(prod.basFeeInfo));
      });

      resp.result.prodList = resp.result.prodList.slice(0, 3);

      return resp.result;
    });
  }
}
