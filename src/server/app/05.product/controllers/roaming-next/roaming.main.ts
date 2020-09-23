import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {REDIS_KEY} from '../../../../types/redis.type';
import moment from 'moment';
import RoamingHelper from './roaming.helper';
import {RoamingController} from './roaming.abstract';

export default class RoamingMainController extends RoamingController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.setDeadline(res);

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
    const debugTid = req.query.tid;
    if (debugTid && process.env['NODE_ENV'] === 'local') {
      if (!isLogin) {
        this.releaseDeadline(res);
        res.redirect('/product/roaming?userId=' + debugTid);
        return;
      }
      this.apiService.request(API_CMD.BFF_03_0001, {}).subscribe(r0 => {
        this.loginService.logoutSession(req, res).subscribe(r1 => {
          this.releaseDeadline(res);
          res.cookie('ROAMING_DTD', debugTid);
          res.redirect('/common/member/logout/complete?n=/product/roaming');
        });
      });
      return;
    }

    Observable.combineLatest(
      this.getPopularNations(),
      RoamingHelper.nationsByContinents(this.redisService),
      this.getCurrentUsingTariff(isLogin),
      this.getRecentUsedTariff(isLogin),
      this.getBanners(pageInfo),
      this.getFirstRoaming(isLogin),
    ).subscribe(([popularNations, nations, currentUse, recentUse, banners, newbie]) => {
      if (popularNations.length > 6) {
        popularNations = popularNations.slice(0, 6);
      }
      this.renderDeadline(res, 'roaming-next/roaming.main.html', {
        svcInfo,
        pageInfo,
        isLogin: isLogin,
        popularNations,
        nations,
        currentUse,
        recentUse,
        banners,
        newbie,
      });
    });
  }

  private getFirstRoaming(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of({});
    }
    return this.apiService.request(API_CMD.BFF_10_0190, {}).map(r => r.result);
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

  private getCurrentUsingTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0055, {}).switchMap(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return Observable.of({code: resp.code, msg: resp.msg});
      }
      // prodInfoTxt: 'T로밍 OnePass300 기간형 외 2건",
      // feeProdYn: Y, 로밍요금제 여부
      // addProdYn: N, 로밍부가서비스 여부
      if (resp.result.feeProdYn === 'Y') {
        return this.apiService.request(API_CMD.BFF_10_0056, {}).switchMap(r0 => {
          if (r0.result && r0.result.roamingProdList) {
            const prodList = r0.result.roamingProdList;
            if (prodList.length > 0) {
              return this.apiService.request(API_CMD.BFF_10_0091, null, null, [prodList[0].prodId]).map(r1 => {
                if (r1.result && r1.result.svcEndDt) {
                  const endDate = moment(r1.result.svcEndDt, 'YYYYMMDD');
                  const today = moment();
                  if (today.isAfter(endDate)) {
                    return null;
                  }
                }
                if (r1.result && r1.result.svcStartDt) {
                  const startDate = moment(r1.result.svcStartDt, 'YYYYMMDD');
                  const today = moment().hours(0).minutes(0);
                  if (today.isBefore(startDate)) {
                    return null;
                  }
                }
                return resp.result;
              });
            }
          }
          return Observable.of(resp.result);
        });
      }
      return Observable.of(resp.result);
    });
  }

  private getRecentUsedTariff(isLogin: boolean): Observable<any> {
    if (!isLogin) {
      return Observable.of(null);
    }
    return this.apiService.request(API_CMD.BFF_10_0197, {}).map(resp => {
      if (resp.result && resp.result.prodId) {
        // 아래 상품은 원장 존재하지 않으므로 미표시
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
        const isAfter = endDate.isAfter(moment());
        // 아직 종료되지 않은 요금제는 표시하지 않기로 함
        if (endDate.isAfter(moment())) {
          return null;
        }
        return {
          prodId: resp.result.prodId,
          prodNm: resp.result.prodNm,
          nights: endDate.diff(startDate, 'days'),
          formattedStartDate: startDate.format('YY.MM.DD'),
          formattedEndDate: endDate.format('YY.MM.DD'),
        };
      }
      return null;
    });
  }

  private getCountryInfo(mcc: string): Observable<any> {
    if (mcc === '') {
      mcc = '202';
    }
    return this.apiService.request(API_CMD.BFF_10_0199, {mcc: mcc}).map(resp => {
      // countryCode, countryNm, countryNmEng, tmdiffTms
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
