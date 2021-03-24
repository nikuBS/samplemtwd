/**
 * @desc 로밍 메인 컨트롤러. (M000439)
 *
 * BFF_10_0190: 첫로밍 판별
 * BFF_10_0055: 현재 이용중인 요금제 (최상단 카드)
 * BFF_10_0197: 최근 이용한 요금제
 * BFF_10_0199: 국가정보 조회
 * BFF_10_0198: 요금제 그룹 전체 조회
 *
 * 쿼리스트링 queryBg로 접근할 경우, 일정선택 팝업 상단에 표시할 국가 이미지를 XHR 로 제공.
 * 로컬환경의 경우, 빠른 유저 스위칭을 위한 코드가 있다.
 *
 * @author 황장호
 * @since 2020-09-01
 */
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import FormatHelper from '../../../../utils/format.helper';
import { RoamingController } from './roaming.abstract';
import RoamingHelper from './roaming.helper';

export default class RoamingMainController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    if (req.query.queryBg) {
      const countryCode = req.query.queryBg;
      // 국가별 이미지 상단 배너 XHR 쿼리
      // queryBg는 ISO3166 알파벳 국가코드 3자리(KOR, JPN) 이며, 아래와 같이 MCC로 변환 후, 배경이미지 주소를 리턴.
      this.getCountryInfo(RoamingHelper.getMCC(countryCode)).subscribe(resp => {
        res.json({
          code: countryCode,
          backgroundUrl: resp.mblBgImg,
        });
      });
      return;
    }

    // 회선이 없는 고객도 로밍 서브메인 접근이 가능해야 됨 (회선이 없는 사용자의 정의는 아래 조건으로 판단 - OP002-13821)
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo) && !FormatHelper.isEmpty(svcInfo.svcGr) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum);

    Observable.combineLatest(
      this.getPopularNations(),
      RoamingHelper.nationsByContinents(this.redisService),
      this.getCurrentUsingTariff(isLogin),
      this.getRecentUsedTariff(isLogin),
      this.getBanners(pageInfo),
      this.getFirstRoaming(isLogin),
      this.getTariffGroups(),
      this.getHistory(isLogin)
    ).subscribe(([popularNations, nations, currentUse, recentUse, banners, newbie, groups, history]) => {
      if (RoamingHelper.renderErrorIfAny(this.error, res, svcInfo, pageInfo,
        [currentUse, newbie, groups, history])) {
        this.releaseDeadline(res);
        return;
      }
      // 인기 여행지의 경우 스펙은 최근 6개만 표시인데, Redis가 30여개 리턴하므로 최근 6개만 컷
      if (popularNations.length > 6) {
        popularNations = popularNations.slice(0, 6);
      }
      this.renderDeadline(res, 'roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        /**
         * 인기여행지 목록.
         * [{countryCode, countryNameKor, countryNameENg, expsSeq, mblBtnImg..},]
         */
        popularNations,
        /**
         * 대륙별 로밍 가능한 전체 국가 목록.
         * [{contnCd, countryCode, countryNameKor, commCdValNm},]
         */
        nations,
        /**
         * 현재 이용 중인 요금제. BFF_10_0055 결과값.
         */
        currentUse,
        /**
         * 최근 이용한 요금제. BFF_10_0197 결과값.
         */
        recentUse,
        /**
         * 어드민 배너
         */
        banners,
        /**
         * 로밍 상품 첫 이용 여부. BFF_10_0190 결과값.
         */
        newbie,
        /**
         * 요금제 그룹 목록 조회. BFF_10_0198 결과값.
         * [{prodGrpId, prodGrpNm, prodGrpDesc, prodGrpBnnrImgUrl},]
         */
        groups,
                /**
         * 요BFF_05_0234(new) T로밍 사용내역 조회-샘플 결과값.
         * true or false, false면 여행 이력 없는 것
         */
        history,
      });
    });
  }

  /**
   * 로밍 상품 첫 이용 여부 조회.
   *
   * @param isLogin 로그인 여부
   * @private
   */
  private getFirstRoaming(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of({});
    }
    return this.apiService.request(API_CMD.BFF_10_0190, {}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      return resp.result;
    });
  }

  /**
   * 인기여행지 목록.
   * [{countryCode, countryNameKor, countryNameENg, expsSeq, mblBtnImg..},]
   *
   * @private
   */
  private getPopularNations(): Observable<any> {
    // redis.type.ts 에 신규 추가한 프로퍼티 2개는 아래와 같다.
    // ROAMING_POPULAR_NATIONS, ROAMING_NATIONS_BY_CONTINENT
    return this.redisService.getData(REDIS_KEY.ROAMING_POPULAR_NATIONS).map(resp => {
      // countryCode
      // countryNameEng
      // countryNameKor
      // expsSeq
      // mblBtnImgId
      // mblBtnImgAltCtt
      const items = resp.result.roamingPopularNationList;
      if (items) {
        // expsSeq 로 정렬이 필요하여 아래와 같이 sort
        return items.sort((o1, o2) => {
          return parseInt(o1.expsSeq, 10) - parseInt(o2.expsSeq, 10);
        });
      }
      return [];
    });
  }

  /**
   * 현재 '이용 중'인 로밍 요금제를 Text 형태로 리턴.
   *
   * BFF_10_0055 사용하며 BE 로부터 'T로밍 OnePass300 기간형 외 2건' 를 받는다.
   * 이용 예정, 이용 완료의 경우의 추가 핸들링을 FE에서 해보았으나 부작용이 많이 생겨서,
   * 현재는 BE_10_0055 결과값을 bypass 한다.
   *
   * @param isLogin 로그인 여부
   * @private
   */
  private getCurrentUsingTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    // 1) 나의 T로밍 이용현황, 2) 로밍메인 상단 3) 로밍모드 상단
    // 위 3개에서 요금제의 '상태' 가 다르게 표시되어 혼란의 여지가 있다.
    return this.apiService.request(API_CMD.BFF_10_0055, {}).switchMap(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return Observable.of(error); }
      // prodInfoTxt: 'T로밍 OnePass300 기간형 외 2건",
      // feeProdYn: Y, 로밍요금제 여부
      // addProdYn: N, 로밍부가서비스 여부

      // [로밍개선과제] BFF_10_0055 결함을 FE 에서 막아보려 했으나 부작용으로 혼란만 가중되어 bypass 하였다.
      // if (resp.result.feeProdYn === 'Y') {
      //   return this.apiService.request(API_CMD.BFF_10_0056, {}).switchMap(r0 => {
      //     if (r0.result && r0.result.roamingProdList) {
      //       const prodList = r0.result.roamingProdList;
      //       if (prodList.length > 0) {
      //         return this.apiService.request(API_CMD.BFF_10_0091, null, null, [prodList[0].prodId]).map(r1 => {
      //           if (r1.result && r1.result.svcEndDt) {
      //             const endDate = moment(r1.result.svcEndDt, 'YYYYMMDD');
      //             const today = moment();
      //             if (today.isAfter(endDate)) {
      //               return null;
      //             }
      //           }
      //           if (r1.result && r1.result.svcStartDt) {
      //             const startDate = moment(r1.result.svcStartDt, 'YYYYMMDD');
      //             const today = moment().hours(0).minutes(0);
      //             if (today.isBefore(startDate)) {
      //               return null;
      //             }
      //           }
      //           return resp.result;
      //         });
      //       }
      //     }
      //     return Observable.of(resp.result);
      //   });
      // }
      return Observable.of(resp.result);
    });
  }

  /**
   * 최근 이용했던 요금제 조회.
   *
   * 로밍메인 화면 중간쯤에 카드 형태로 표시할 내용으로,
   * BFF_10_0197 결과값을 사용하는데, 아직 종료되지 않은 요금제는 안나와야 한다고 하여 (석연실 매니저)
   * BFF 호출 후, svcEndDt를 참조하여 종료여부에 따라 미표시하는 방어코드 로직이 있다.
   *
   * @param isLogin 로그인 여부
   * @private
   */
  private getRecentUsedTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0197, {}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      if (resp.result && resp.result.prodId) {
        // 아래 상품은 원장 존재하지 않으므로 미표시 했었으나, 코드이력 관리에 어려움이 있어 주석처리.
        // NA00005904 자동안심T로밍 데이터,
        // NA00004963 T로밍 Biz 요금제,
        // if (['NA00005904', 'NA00004963'].indexOf(resp.result.prodId) >= 0) {
        //   return null;
        // }

        // prodId, prodNm: 'baro 4GB',
        // svcStartDt, svcEndDt: '20190828',
        // startEndTerm: '30',
        const startDate = moment(resp.result.svcStartDt, 'YYYYMMDD');
        const endDate = moment(resp.result.svcEndDt, 'YYYYMMDD');
        // 아직 종료되지 않은 요금제는 표시하지 않기로 함. 방어코드.
        if (endDate.isAfter(moment())) {
          return null;
        }
        return {
          prodId: resp.result.prodId,
          prodNm: resp.result.prodNm,
          nights: endDate.diff(startDate, 'days'),
          formattedStartDate: startDate.format('YYYY. M. D.'),
          formattedEndDate: endDate.format('YYYY. M. D.'),
        };
      }
      return null;
    });
  }

  /**
   * 국가 정보 조회 (BFF_10_0199)
   *
   * @param mcc mobileCountryCode
   * @private
   */
  private getCountryInfo(mcc: string): Observable<any> {
    if (mcc === '') {
      // MCC 미존재시 공통 이미지 읽어오기 위한 용도로 그리스 코드 지정
      mcc = '202';
    }
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      // countryCode, countryNm, countryNmEng, tmdiffTms
      return resp.result;
    });
  }

  /**
   * 배너조회
   * REDIS_KEY.BANNER_ADMIN + pageInfo.menuId
   *
   * @param pageInfo 페이지정보
   * @returns Redis:$(MENU_ID) 내의 모든 배너 목록
   */
  private getBanners(pageInfo): Observable<any> {
    return this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId).map(resp => {
      if ( resp.code !== API_CODE.REDIS_SUCCESS ) {
        // 부분 차단
        return null;
      }

      if ( FormatHelper.isEmpty(resp.result) ) {
        return resp.result;
      }

      if (resp.result.banners) {
        return resp.result.banners;
      }
      return null;
    });
  }

  /**
   * 요금제그룹(5개) 목록 조회
   * BFF_10_0198
   *
   * @private
   */
  private getTariffGroups(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }
      let items = resp.result.grpProdList;
      if (!items) {
        items = [];
      }
      // prodGrpId: T0000094
      // prodGrpNm: baro 3/4/7
      // prodGrpDesc: 장거리 또는 ..
      // prodGrpBnnrImgUrl: /adminupload/
      return items;
    });
  }

  /**
   * 로밍 히스토리 목록, 목록이 하나라도 있으면 true 리턴, 지난 여행 이력보기 문구 노출에 활용
   * BFF_05_0234
   *
   * @private
   */
  private getHistory(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }

    return this.apiService.requestStore(SESSION_CMD.BFF_05_0234, {}).map((resp) => {
      
      const error = RoamingHelper.checkBffError(resp);
      if (error) { return error; }

      return FormatHelper.isEmpty(resp.result[0]) ? false : true;

    }); // end of api request

  } // end of getHistory

}
