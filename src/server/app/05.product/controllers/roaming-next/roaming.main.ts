import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';

export default class RoamingMainController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = FormatHelper.isEmpty(svcInfo);
    Observable.combineLatest(
      this.getPopularNations(),
      this.getNationsByContinents('AFR'),
      this.getNationsByContinents('ASP'),
      this.getNationsByContinents('AMC'),
      this.getNationsByContinents('EUR'),
      this.getNationsByContinents('MET'),
      this.getNationsByContinents('OCN'),
    ).subscribe(([popularNations, afr, asp, amc, eur, met, ocn]) => {

      if (popularNations.length > 15) {
        popularNations = popularNations.slice(0, 15);
      }

      res.render('roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        popularNations,
        nations: {afr, asp, amc, eur, met, ocn},
      });
    });
  }

  private getNationsByContinents(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.contnPsbNation;
    });
  }

  private getPopularNations(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.ROAMING_POPULAR_NATIONS).map(resp => {
      // countryCode
      // countryNameEng
      // countryNameKor
      // expsSeq
      // mblBtnImgId
      // mblBtnImgAltCtt
      const items = resp.result.roamingPopularNationList;
      if (items) {
        return items.sort((o1, o2) => {
          return parseInt(o1.expsSeq, 10) - parseInt(o2.expsSeq, 10);
        });
      }
      return [];
    });
  }
}
