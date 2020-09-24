import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import {RoamingController} from './roaming.abstract';

export default class RoamingRatesByCountryController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);

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
    ).subscribe(([afr, asp, amc, eur, met, ocn]) => {
      this.renderDeadline(res, 'roaming-next/roaming.rates.html', {
        svcInfo,
        pageInfo,
        equipment,
        meta: null,
        lastQuery: {countryNm: ''},
        isLogin: isLogin,
        nations: {afr, asp, amc, eur, met, ocn},
      });
    });
  }

  private getNationsByContinents(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
    });
  }
}
