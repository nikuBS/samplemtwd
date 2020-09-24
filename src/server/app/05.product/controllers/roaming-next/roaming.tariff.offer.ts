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
      this.queryAvailableCountries(req, res, req.query.prodId);
      return;
    }

    const countryCode = req.query.code;

    const from = moment(req.query.from, 'YYYYMMDD');
    const to = moment(req.query.to, 'YYYYMMDD');
    const night = to.diff(from) / 86400 / 1000;

    Observable.combineLatest(
      this.getCountryInfo(countryCode),
      this.getRecommendedTariff(countryCode, from.format('YYYYMMDD'), to.format('YYYYMMDD')),
      this.getAvailableTariffs(countryCode),
      this.getRecentUsedTariff(),
      this.getFirstRoaming(),
      this.getTariffsMap(),
    ).subscribe(([country, recommended, allTariffs, recentUsed, newbie, tariffsMap]) => {
      if (country.mblNflagImgAlt && country.mblNflagImgAlt.indexOf('공통 이미지') >= 0) {
        country.mblNflagImg = null;
      }

      if (recommended) {
        const detail = RoamingHelper.formatTariff(tariffsMap[recommended.prodId]);
        if (detail) {
          Object.assign(recommended, detail);
        }
      } else {
        recommended = {};
      }

      if (!allTariffs) {
        allTariffs = [];
      }

      this.renderDeadline(res, 'roaming-next/roaming.tariff.offer.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        country: {
          code: country.countryCode,
          name: country.countryNm,
          imageUrl: RoamingHelper.penetrateUri(country.mblRepImg),
          flagUrl: RoamingHelper.penetrateUri(country.mblNflagImg),
          flagAlt: country.mblNflagImgAlt,
        },
        night: night,
        days: night + 1,
        recommended,
        recentUsed,
        newbie,
          availableTariffs: allTariffs.map(t => RoamingHelper.formatTariff(t)),
      });
    });
  }

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

  private getFirstRoaming(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0190, {}).map(r => r.result);
  }

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
        item.countryCode = countryCode;
        item.countryNm = '...';
        return this.getNationsByContinents().map(r => {
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

  private getNationsByContinents(): Observable<any> {
    return Observable.combineLatest(
      this.getNationsByContinent('AFR'),
      this.getNationsByContinent('ASP'),
      this.getNationsByContinent('AMC'),
      this.getNationsByContinent('EUR'),
      this.getNationsByContinent('MET'),
      this.getNationsByContinent('OCN')
    ).map(([afr, asp, amc, eur, met, ocn]) => {
      return {afr, asp, amc, eur, met, ocn};
    });
  }

  private getNationsByContinent(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
    });
  }


  /**
   * 해당 국가로의 주어진 일정동안 사용하기 적절한 추천 요금제를 가져온다.
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
            t.prodBasBenfCtt = t.prodBasBenfCtt.replace('baro통화 무료', 'baro 통화 무제한');
          }
        }
      }
      return resp.result;
    });
  }

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
