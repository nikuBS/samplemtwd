/**
 * 로밍 국가별 이용요금 조회.
 *
 * BFF_10_0061: 국가별 로밍 가능여부 조회
 */
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import {RoamingController} from './roaming.abstract';

export default class RoamingRatesByCountryResultController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);

    const query = {
      countryCd: req.query.code,
      countryNm: decodeURIComponent(req.query.nm),
      eqpMdlNm: decodeURIComponent(req.query.eqpNm),
      eqpMdlCd: decodeURIComponent(req.query.eqpCd)
    };
    const apiParams = {
      countryCode: query.countryCd,
      command: 'onlyCountry',
      eqpMdlCd: query.eqpMdlCd,
    };
    if (svcInfo) {
      if (!svcInfo.eqpMdlNm) {
        apiParams.command = 'onlyCountry';
      } else {
        apiParams.command = 'withCountry';
      }
    } else {
      if (!query.eqpMdlNm) {
        apiParams.command = 'onlyCountry';
      } else {
        apiParams.command = 'withCountry';
      }
    }

    const equipment = {
      number: null,
      name: null,
      code: null,
    };
    if (isLogin) {
      equipment.number = svcInfo.svcNum;
      equipment.name = svcInfo.eqpMdlNm;
      equipment.code = svcInfo.eqpMdlCd;
    }

    Observable.combineLatest(
      this.getNationsByContinents('AFR'),
      this.getNationsByContinents('ASP'),
      this.getNationsByContinents('AMC'),
      this.getNationsByContinents('EUR'),
      this.getNationsByContinents('MET'),
      this.getNationsByContinents('OCN'),
      this.getRoamingMeta(apiParams),
    ).subscribe(([afr, asp, amc, eur, met, ocn, meta]) => {
      for (const continent of [afr, asp, amc, eur, met, ocn]) {
        const list = continent;
        for (const c of list) {
          if (c['countryCode'] === query.countryCd) {
            query.countryNm = c['countryNameKor'];
            break;
          }
        }
      }

      this.renderDeadline(res, 'roaming-next/roaming.rates.html', {
        svcInfo,
        pageInfo,
        equipment,
        meta,
        lastQuery: query,
        isLogin: isLogin,
        nations: {afr, asp, amc, eur, met, ocn},
      });
    });
  }

  private getRoamingMeta(param: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0061, param).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
      // voiceRoamingYn: 'Y'
      // dataRoamingYn: 'Y'
      // gsm: '3'
      // wcdma: '0'
      // cdma: '0'
      // rent: '0'
      // lte: '0'
      return resp.result;
    });
  }

  private getNationsByContinents(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
    });
  }
}
