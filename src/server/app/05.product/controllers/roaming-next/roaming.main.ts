import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import moment from 'moment';
import RoamingHelper from './roaming.helper';

export default class RoamingMainController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (req.query.queryBg) {
      const countryCode = req.query.queryBg;
      this.getCountryInfo(RoamingHelper.getMCC(countryCode)).subscribe(resp => {
        res.json({
          code: countryCode,
          backgroundUrl: resp.mblBgImg,
        });
      });
      return;
    }

    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    Observable.combineLatest(
      this.getPopularNations(),
      this.getNationsByContinents('AFR'),
      this.getNationsByContinents('ASP'),
      this.getNationsByContinents('AMC'),
      this.getNationsByContinents('EUR'),
      this.getNationsByContinents('MET'),
      this.getNationsByContinents('OCN'),
      this.getRecentUsedTariff(isLogin),
      this.getBanners(pageInfo),
    ).subscribe(([popularNations, afr, asp, amc, eur, met, ocn, recentUsed, banners]) => {

      if (popularNations.length > 15) {
        popularNations = popularNations.slice(0, 15);
      }

      res.render('roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        popularNations,
        nations: {afr, asp, amc, eur, met, ocn},
        recentUsed,
        banners,
      });
    });
  }

  private getNationsByContinents(continent: string): Observable<any> {
    return this.redisService.getData(`${REDIS_KEY.ROAMING_NATIONS_BY_CONTINENT}:${continent}`).map(resp => {
      // contnCd, countryCode, countryNameKor, commCdValNm
      return resp.result.contnPsbNation;
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

  private getRecentUsedTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0197, {}).map(resp => {
      // prodId, prodNm: 'baro 4GB',
      // svcStartDt, svcEndDt: '20190828',
      // startEndTerm: '30',
      if (resp.result) {
        const startDate = moment(resp.result.svcStartDt, 'YYYYMMDD');
        const endDate = moment(resp.result.svcEndDt, 'YYYYMMDD');
        resp.result.nights = endDate.diff(startDate, 'days');
        resp.result.formattedStartDate = startDate.format('YY.MM.DD');
        resp.result.formattedEndDate = endDate.format('YY.MM.DD');
      }
      return resp.result;
    });
  }

  private getCountryInfo(mcc): Observable<any> {
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
      console.log(resp.result);
      return resp.result;
    });
  }

  /**
   * 배너조회
   * @param pageInfo 페이지정보
   * @returns 성공 시 result에 상단, 중단 배너를 분류한 프로퍼티를 추가하여 반한하고, 실패 시 null 반환
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

      resp.result.topBanners = resp.result.banners.filter(function (banner) {
        return banner.bnnrLocCd === 'T';
      });
      resp.result.topBanners.sort(function (a, b) {
        return Number(a.bnnrExpsSeq) - Number(b.bnnrExpsSeq);
      });
      return resp.result;
    });
  }
}
