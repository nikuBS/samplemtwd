/**
 * @desc 로밍 요금제 추천. (M002257)
 *
 * BFF_10_0190: 첫 로밍 여부 조회 (첫 로밍이면 중간에 이미지 노출)
 * BFF_10_0196: 추천 요금제
 * BFF_10_0197: 최근 이용한 요금제 조회
 * BFF_10_0198: 요금제 그룹 전체 조회
 * BFF_10_0199: 국가정보 조회
 * BFF_10_0200: 국가별 이용 가능한 요금제 목록
 * BFF_10_0201: 요금제별 이용 가능한 국가 목록
 *
 * @author 황장호
 * @since 2020-09-01
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';
import RoamingHelper from './roaming.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import {RoamingController} from './roaming.abstract';

export default class RoamingTariffOfferController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    if (req.query.prodId) {
      // 서비스 이용가능 국가 Dialog 에서 XHR로 조회하는 함수.
      this.queryAvailableCountries(req, res, req.query.prodId);
      return;
    }

    const countryCode = req.query.code;

    const from = moment(req.query.from, 'YYYYMMDD');
    const to = moment(req.query.to, 'YYYYMMDD');
    // 가는 날, 오는 날 기반으로 몇 박인지 계산
    const night = to.diff(from) / 86400 / 1000;

    Observable.combineLatest(
      this.getCountryInfo(countryCode),
      this.getRecommendedTariff(countryCode, from.format('YYYYMMDD'), to.format('YYYYMMDD')),
      this.getAvailableTariffs(countryCode),
      this.getRecentUsedTariff(),
      this.getFirstRoaming(),
      this.getTariffsMap(),
    ).subscribe(([country, recommended, allTariffs, recentUsed, newbie, tariffsMap]) => {
      // 유명 국가 30개가 아닌 경우, 화면 최하단 UI 카드에 국기를 표시하지 않는 것이 스펙이다.
      // 그러므로 조회된 국가 정보에 '공통 이미지'가 포함된 경우, 국기 이미지를 제거.
      if (country.mblNflagImgAlt && country.mblNflagImgAlt.indexOf('공통 이미지') >= 0) {
        country.mblNflagImg = null;
      }

      if (recommended) {
        // 추천 요금제가 존재하는 경우, 요금제 정보를 정규화
        const detail = RoamingHelper.formatTariff(tariffsMap[recommended.prodId]);
        if (detail) {
          Object.assign(recommended, detail);
        }
      } else {
        // 방어코드
        recommended = {};
      }

      // 방어코드
      if (!allTariffs) {
        allTariffs = [];
      }

      this.renderDeadline(res, 'roaming-next/roaming.tariff.offer.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        // 국가 정보
        country: {
          code: country.countryCode,
          name: country.countryNm,
          imageUrl: RoamingHelper.penetrateUri(country.mblBgImg),
          // 국기 이미지
          flagUrl: RoamingHelper.penetrateUri(country.mblNflagImg),
          // 국기 이미지 alt
          flagAlt: country.mblNflagImgAlt,
        },
        // n박 m일의 '박'
        night: night,
        // n박 m일의 '일'
        days: night + 1,
        // 추천된 요금제
        recommended,
        // 최근 이용한 요금제
        recentUsed,
        // 첫 로밍고객 여부
        newbie,
        // 해당 국가에서 이용 가능한 모든 요금제
        availableTariffs: allTariffs.map(t => RoamingHelper.formatTariff(t)),
      });
    });
  }

  /**
   * 모든 로밍 요금제(BFF_10_0198)를 조회하여 그룹 정보를 제외한 flatten map을 리턴.
   *
   * @private
   */
  private getTariffsMap(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0198, {}).map(resp => {
      const items = resp.result.grpProdList;
      if (!items) {
        return [];
      }
      const flatten = {};
      for (const g of items) {
        for (const i of g.prodList) {
          flatten[i.prodId] = i;
        }
      }
      return flatten;
    });
  }

  /**
   * 로밍 요금제 첫 이용여부 조회. (BFF_10_0190)
   *
   * @private
   */
  private getFirstRoaming(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0190, {}).map(r => r.result);
  }

  /**
   * 최근 사용한 로밍 요금제 조회. (BFF_10_0197)
   *
   * @private
   */
  private getRecentUsedTariff(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0197, {}).map(resp => {
      if (resp.result && resp.result.prodId) {
        return resp.result;
      }
      return null;
    });
  }

  /**
   * 해당 국가의 메타정보인 국가명, 한국과의 tzOffset, 국기 이미지 리소스 등
   * (BFF_10_0199)
   *
   * @param countryCode ISO3601 3자리 국가코드
   * @private
   */
  private getCountryInfo(countryCode: string): Observable<any> {
    const mcc = RoamingHelper.getMCC(countryCode);
    const noFlag = mcc === '';
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: noFlag ? '202' : mcc}).switchMap(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
      const item = resp.result;
      if (!item) {
        return item;
      }

      if (noFlag) {
        // 로밍 미지원 국가의 경우, 화면이 완전히 깨지지 않게 한다.
        item.countryCode = countryCode;
        item.countryNm = '...';
        return RoamingHelper.nationsByContinents(this.redisService).map( r => {
          for (const continent of Object.keys(r)) {
            const list = r[continent];
            for (const c of list) {
              if (c['countryCode'] === countryCode) {
                item.countryNm = c['countryNameKor'];
                item.countryNmEng = c['countryNameEng'];
                return item;
              }
            }
          }
          return item;
        });
      }
      return Observable.of(item);
    });
  }

  /**
   * 해당 국가로의 주어진 일정동안 사용하기 적절한 추천 요금제를 가져온다. (BFF_10_0196)
   *
   * @param countryCode 3자리 국가코드
   * @param startDate yyyyMMdd
   * @param endDate yyyyMMdd
   * @private
   */
  private getRecommendedTariff(countryCode: string, startDate: string, endDate: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0196, {
      countryCode,
      svcStartDt: startDate,
      svcEndDt: endDate
    }).map(resp => {
      // prodId: NA00006489
      // prodNm: baro 3GB
      // prodSmryDesc: 아시아,미주,유럽에서
      // basFeeInfo: 상세참조
      // startEndTerm: '7'
      // neiborRomPsblNatInfo: '캐나다'
      const item: any = resp.result;
      // if (!item.prodId) {
      //   item.prodId = 'NA00006489';
      //   item.prodNm = 'baro 3GB';
      //   item.prodSmryDesc = '아시아,미주,유럽,호주에서 7일간 로밍데이터 3GB를 이용하는 요금제입니다.';
      //   item.basFeeInfo = '상세참조';
      //   item.startEndTerm = '7';
      //   item.price = '29,000원/7일';
      //   item.data = '4GB';
      //   item.phone = 'baro통화 무제한';
      // }
      return item;
    });
  }

  /**
   * 주어진 국가에서 이용 가능한 모든 요금제 목록을 리턴. (BFF_10_0200)
   *
   * @param countryCode 국가코드 ISO3166 3자리
   * @param skip true 인 경우 BFF 호출을 하지 않고 빈 배열을 바로 리턴.
   * @private
   */
  private getAvailableTariffs(countryCode: string, skip: boolean = false): Observable<any> {
    if (skip) {
      return Observable.of([]);
    }
    return this.apiService.request(API_CMD.BFF_10_0200, {countryCode}).map(resp => {
      // prodGrpId: 'T000000091',
      // prodId: 'NA0000000',
      // prodNm: 'T로밍 아시아패스',
      // romUsePrdInfo: '30', // 로밍사용기간정보
      // basOfrMbDataQtyCtt: '-', // 기본제공 MB데이터량 내용
      // basOfrDataQtyCtt: '-', // 기본제공 데이터량 내용
      // prodBaseBenfCtt: 'baro통화 무료', // 상품 기본혜택 내용
      // basFeeInfo: '40000', // 상품금액
      if (resp.result) {
        for (const t of resp.result) {
          if (t.prodBasBenfCtt) {
            // baro 통화 사이에 띄어쓰기가 안된 경우 FE 에서 방어코드로 막아준다.
            t.prodBasBenfCtt = t.prodBasBenfCtt.replace('baro통화 무료', 'baro 통화 무제한');
          }
        }
      }
      return resp.result;
    });
  }

  /**
   * 주어진 요금제를 이용 가능한 모든 국가 목록을 리턴한다.
   * 서비스 가능한 국가가 없는 경우 error code PRD0075.
   *
   * @param prodId 요금제 원장번호
   * @private
   */
  private getAvailableCountries(prodId: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0201, {prodId}).map(resp => {
      if (!resp.result && resp.msg && resp.code) {
        // 서비스 가능한 국가 없을 때 PRD0075
        return {
          code: resp.code,
          msg: resp.msg,
        };
      }
      return resp.result;
    });
  }

  /**
   * 특정 요금제에 대해 이용 가능한 모든 국가를 조회.
   * 서비스 이용가능국가 다이얼로그에서 XHR로 조회한다.
   *
   * @param req Express Request 객체. query.wt(withTariffs) 여부에 따라 전체 요금제 목록을 리턴.
   * @param res 조회 결과를 JSON으로 보낼 Express Response 객체.
   * @param prodId 로밍 요금제 prodId
   * @private
   */
  private queryAvailableCountries(req: Request, res: Response, prodId: string) {
    Observable.combineLatest(
      this.getAvailableTariffs('ALL', req.query.wt ? false : true),
      this.getAvailableCountries(prodId),
    ).subscribe(([tariffs, countries]) => {
      // tariffs
      //   prodId, prodNm,
      //   prodGrpId: 'T00000077',
      //   romUsePrdInfo: '30' (days)
      //   basOfrMbDataQtyCtt: '상세참조'
      //   basOfrDataQtyCtt: '4.0'
      //   basFeeInfo: '무료' | '39000'
      //   prodBasBenfCtt: 'baro통화 무료'
      this.releaseDeadline(res);
      res.json({
        tariffs: tariffs,
        items: countries,
      });
    });
  }
}
