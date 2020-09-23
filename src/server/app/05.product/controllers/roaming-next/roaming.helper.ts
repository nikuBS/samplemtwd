import EnvHelper from '../../../../utils/env.helper';
import {Observable} from 'rxjs/Observable';
import {REDIS_KEY} from '../../../../types/redis.type';
import RedisService from '../../../../services/redis.service';

export default class RoamingHelper {
  static penetrateUri(uri: string): string {
    if (!uri) {
      return uri;
    }
    const env = String(process.env.NODE_ENV);
    if (env === 'local' && uri.startsWith('/adminupload')) {
      return 'http://mtw.told.me/cdn' + uri;
    }
    return EnvHelper.getEnvironment('CDN') + uri;
  }

  static getMCC(alpha3: string): string {
    const mcc = ISO3166[alpha3];
    if (!mcc) {
      return '';
    }
    return mcc.toString();
  }

  static nationsByContinents(rs: RedisService): Observable<any> {
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
        return 14;
    }
    return 0;
  }

  static formatTariff(t: any) {
    if (!t) {
      return t;
    }
    if (t.basFeeInfo) {
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
    if (t.romUsePrdInfo) {
      const value = parseInt(t.romUsePrdInfo, 10);
      t.duration = value <= 1 ? 1 : value;
    } else {
      t.duration = 1;
    }
    if (!t.basOfrDataQtyCtt || t.basOfrDataQtyCtt === '-') {
      // t.data = DATA_PROVIDED[t.prodId];
      t.data = '-';

      if (t.basOfrMbDataQtyCtt && t.romUsePrdInfo === '0') {
        t.data = '매일 ' + t.basOfrMbDataQtyCtt + 'MB';
      } else if (t.prodId === 'NA00006229') {
        // T괌사이판 5천원
        t.data = '매일 500MB';
      } else if (parseInt(t.basOfrGbDataQtyCtt, 10) > 0) {
        const gbData = parseInt(t.basOfrGbDataQtyCtt, 10);
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrMbDataQtyCtt;
      }
    } else {
      const gbData = parseInt(t.basOfrDataQtyCtt, 10);
      if (gbData > 0) {
        t.data = gbData + 'GB';
      } else {
        t.data = t.basOfrDataQtyCtt;
      }
    }

    // OnePass VIP 설명 예외처리
    // NA00006486, NA00006487  VIP
    if (['NA00006486', 'NA00006487'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
      t.phone = '음성 30분 / 문자 30건 / baro통화 무제한';
    }
    // NA00006744, NA00006745  DATA VIP
    if (['NA00006744', 'NA00006745'].indexOf(t.prodId) >= 0) {
      t.data = '무제한';
    }
    if (!t.phone) {
      t.phone = 'baro통화 무제한';
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

