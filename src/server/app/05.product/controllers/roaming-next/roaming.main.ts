import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';

export default class RoamingMainController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = FormatHelper.isEmpty(svcInfo);
    // if (isLogin) {
    //   this.renderAnonymous(res, svcInfo, pageInfo);
    // }
    Observable.combineLatest(
      this.getPopularNations(),
      this.redisService.getData(REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT + ':AFR'),
    ).subscribe(([popularNations, continents]) => {

      if (popularNations.length > 6) {
        popularNations = popularNations.slice(0, 6);
      }
      // popularNations = popularNations.filter(n => n.mblBtnImgId != null);
      res.render('roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        popularNations,
      });
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
      return resp.result.roamingPopularNationList.sort((o1, o2) => {
        return parseInt(o1.expsSeq, 10) - parseInt(o2.expsSeq, 10);
      });
    });
  }
}
