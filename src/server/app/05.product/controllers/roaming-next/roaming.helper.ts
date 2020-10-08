/**
 * 로밍 서비스 전체에서 공통으로 사용하는 Helper.
 *
 * 요금제의 가격이나 설명을 포매팅하는 범용 함수인 formatTariff.
 * 전체 국가 목록을 가져오는 nationsByContinents.
 * 유명국가 30개에 대한 MCC 테이블 ISO3166.
 * 요금제 그룹 1~12에 대한 테이블 getTariffGroup.
 */
import EnvHelper from '../../../../utils/env.helper';
import {Observable} from 'rxjs/Observable';
import {REDIS_KEY} from '../../../../types/redis.type';
import RedisService from '../../../../services/redis.service';

export default class RoamingHelper {
  /**
   * @desc /adminupload/123/456/a.png 형식의 uri을 받아,
   * 현 환경의 CDN host prefix를 합친 full uri을 리턴한다.
   * EJS 에서 <%= CDN %> 붙인 것과 동일한 동작을 한다.
   *
   * @param uri /adminupload/123/456/a.png
   */
  static penetrateUri(uri: string): string {
    if (!uri) {
      return uri;
    }
    return EnvHelper.getEnvironment('CDN') + uri;
  }

  /**
   * @desc 국가코드 3자리(KOR 형식)를 MCC로 변환해준다.
   * 유명 국가 30개만 지원하며, 미지원 국가의 경우 빈 문자열을 리턴한다.
   *
   * @param alpha3 국가코드 3자리
   */
  static getMCC(alpha3: string): string {
    const mcc = ISO3166[alpha3];
    if (!mcc) {
      return '';
    }
    return mcc.toString();
  }

  /**
   * @desc 대륙(6개)별 로밍 가능한 모든 국가 목록을 Redis 로부터 가져온다.
   *
   * @param rs RedisService instance
   */
  static nationsByContinents(rs: RedisService): Observable<any> {
    // AFR - 아프리카
    // ASP - 아시아
    // AMC - 미주
    // EUR - 유럽
    // MET - 중동
    // OCN - 오세아니아
    return Observable.combineLatest(
      this._getNationsByContinent(rs, 'AFR'),
      this._getNationsByContinent(rs, 'ASP'),
      this._getNationsByContinent(rs, 'AMC'),
      this._getNationsByContinent(rs, 'EUR'),
      this._getNationsByContinent(rs, 'MET'),
      this._getNationsByContinent(rs, 'OCN')
    ).map(([afr, asp, amc, eur, met, ocn]) => {
      return {afr, asp, amc, eur, met, ocn};
    });
  }

  static _getNationsByContinent(rs: RedisService, continent: string): Observable<any> {
    return rs.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
    });
  }

  /**
   * 원장정보(prodId)를 받아 어느 '요금제 그룹'에 속하는지 알려준다.
   * 어느 그룹에도 속하지 않는 원장인 경우 0 을 리턴.
   *
   * @param planId 원장정보 ID
   */
  static getTariffGroup(planId: string): number {
    switch (planId) {
      case 'NA00005252': case 'NA00005300': case 'NA00005505': case 'NA00006489': case 'NA00006493':
      case 'NA00006497': case 'NA00005301': case 'NA00005337': case 'NA00005506': case 'NA00005900':
      case 'NA00005901': case 'NA00005902': case 'NA00005903': case 'NA00006038': case 'NA00006039':
      case 'NA00006040': case 'NA00006041': case 'NA00006042': case 'NA00006043': case 'NA00006044':
      case 'NA00006045': case 'NA00006490': case 'NA00006491': case 'NA00006492': case 'NA00006494':
      case 'NA00006495': case 'NA00006496': case 'NA00006498': case 'NA00006499': case 'NA00006500':
        return 1;
      case 'NA00005699': case 'NA00005747': case 'NA00005898': case 'NA00005899':
        return 2;
      case 'NA00005690': case 'NA00005692': case 'NA00005693': case 'NA00005695': case 'NA00006388':
      case 'NA00006389': case 'NA00006390': case 'NA00006828':
        return 3;
      case 'NA00006226':
        return 4;
      case 'NA00006745': case 'NA00006746':
        return 5;
      case 'NA00006487': case 'NA00006488':
        return 6;
      case 'NA00004088': case 'NA00004883': case 'NA00005047': case 'NA00005048':
        // baro OnePass 300 기간형
        // baro OnePass 300 기간형2 (2020-10-07 현존하지 않는 상품)
        // baro OnePass 500 기간형
        // baro OnePass 500 기간형2 (2020-10-07 현존하지 않는 상품)
        return 7;
      case 'NA00006229':
        return 8;
      case 'NA00004942':
        return 9;
      case 'NA00004299':
      case 'NA00004326':
        return 10;
      case 'NA00004941':
        return 11;
      case 'NA00006744':
        return 12;
      case 'NA00006486':
        return 13;
      case 'NA00003196': case 'NA00005049':
        // baro OnePass 300 기본형
        // baro OnePass 500 기본형
        return 14;
    }
    return 0;
  }

  /**
   * @desc 요금제 정보 구조체의 이해하기 어려운 프로퍼티들을 종합 판단하여,
   *       가격정보, 데이터 사용량, 통화제공량 등을 정규화하는 함수.
   *       정규화한 값들은 t.price, t.duration, t.data, t.phone 에 채워준다.
   *
   * @param t BE 에서 준 요금제 관련 구조체
   */
  static formatTariff(t: any) {
    if (!t) {
      return t;
    }

    // 금액 정규화
    if (t.basFeeInfo) { // 상품금액
      let iFee: any = parseInt(t.basFeeInfo, 10);
      if (iFee) {
        if (iFee >= 1000) {
          iFee = iFee.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        t.price = iFee + '원';
      } else {
        t.price = t.basFeeInfo;
      }
    }

    // 이용기간 정규화
    if (t.romUsePrdInfo) {
      const value = parseInt(t.romUsePrdInfo, 10);
      t.duration = value <= 1 ? 1 : value;
    } else {
      t.duration = 1;
    }

    // 데이터사용량 정규화
    if (!t.basOfrDataQtyCtt || t.basOfrDataQtyCtt === '-') {
      // t.data = DATA_PROVIDED[t.prodId];
      t.data = '-';

      // romUsePrdInfo(로밍사용기간정보)가 0이면 basOfrMbDataQtyCtt에 매일 사용량이 들어온다.
      if (t.basOfrMbDataQtyCtt && t.romUsePrdInfo === '0') {
        t.data = '매일 ' + t.basOfrMbDataQtyCtt + 'MB';
      } else if (t.prodId === 'NA00006229') {
        // T괌사이판 5천원인 경우 데이터 이용량 하드코딩 (BE 이지민 수석 요청)
        t.data = '매일 500MB';
      } else if (parseInt(t.basOfrGbDataQtyCtt, 10) > 0) {
        const gbData = parseInt(t.basOfrGbDataQtyCtt, 10);
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrMbDataQtyCtt;
      }
    } else {
      // basOfrDataQtyCtt 값이 있는 경우, GB 이므로 단위량을 붙여준다.
      // 만약 원본값에 문제가 있다면 그대로 bypass 한다.
      const gbData = parseInt(t.basOfrDataQtyCtt, 10);
      if (gbData > 0) {
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrDataQtyCtt;
      }
    }

    // 상품 특이사항 정규화
    if (t.prodBaseBenfCtt) {
      t.phone = t.prodBaseBenfCtt;
    }

    // BE가 처리하지 못한 요구사항들을 FE에서 방어적으로 처리하는 부분으로,
    // BE 개선이 되면 불필요해진다.

    // OnePass VIP 설명 예외처리
    // NA00006486, NA00006487  VIP (요금제 그룹 6번)
    if (['NA00006486', 'NA00006487'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
      t.phone = '음성 30분 / 문자 30건 / baro 통화 무제한';
    }
    // NA00006744, NA00006745  DATA VIP (요금제 그룹 5번)
    if (['NA00006744', 'NA00006745'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
    }

    if (!t.phone) {
      t.phone = 'baro 통화 무제한';
    }
    return t;
  }
}

const ISO3166 = {
  'CHN': 460, 'JPN': 440, 'VNM': 452, 'USA': 310, 'PHL': 515, 'ITA': 222, 'TWN': 466, 'HKG': 454,
  'MYS': 502, 'SGP': 525, 'FRA': 208, 'IDN': 510, 'ESP': 214, 'CAN': 302, 'GBR': 234, 'RUS': 250,
  'MAC': 455, 'AUS': 505, 'ARE': 424, 'TUR': 286, 'GUM': 535, 'AUT': 232, 'CHE': 228, 'IND': 404,
  'KHM': 456, 'CZE': 230, 'NLD': 204, 'LAO': 457, 'DEU': 262, 'THA': 520,
};

