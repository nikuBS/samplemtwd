/**
 * @file main.store.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.03.12
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../utils/browser.helper';
import { CHANNEL_CODE, REDIS_KEY } from '../../../types/redis.type';
import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

class MainStore extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const noticeCode = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;

    this.getRedisData(noticeCode)
      .subscribe((resp) => {
        res.render(`main.store.html`, { svcInfo, redisData: resp, pageInfo });
      });
  }

  private getRedisData(noticeCode): Observable<any> {
    return Observable.combineLatest(
      this.getHomeNotice(noticeCode),
      this.getHomeHelp()
    ).map(([notice, help]) => {
      let mainNotice = null;
      if ( !FormatHelper.isEmpty(notice) ) {
        mainNotice = notice.mainNotice;
      }
      return { mainNotice, help };
    });
  }

  private getHomeNotice(noticeCode): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTICE + noticeCode)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //   return resp.result;
        // }
        return resp.result;
      });
  }

  private getHomeHelp(): Observable<any> {
    let result = null;
    return this.redisService.getData(REDIS_KEY.HOME_HELP)
      .map((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          result = this.parseHelpData(resp.result.cicntsList);
        }
        return result;
      });
  }

  private parseHelpData(cicntsList): any {
    const resultArr = <any>[];
    //(function(flag){ cicntsList.forEach(function(e){ e.isRolling = flag;}); })(!Math.floor(Math.random() * 2)); // 첫번재 Result의 자동롤링 여부를 임시 삽입
    //(function(flag){ cicntsList.forEach(function(e){ e.isRandom = flag;}); })(!Math.floor(Math.random() * 2)); // 첫번재 Result의 자동롤링 여부를 임시 삽입
    (function(flag){ cicntsList.forEach(function(e){ e.isRolling = flag;}); })(true);

    for ( let i = 0; i < cicntsList.length; i += 3 ) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

}

export default MainStore;
