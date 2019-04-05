/**
 * FileName: myt-data.familydata.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { delay, tap, map, retryWhen } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

export default class MyTDataFamilyShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // Observable.combineLatest(this.getShareData(), this.getMonthlyInfo()).subscribe(([immediately, monthly]) => {
    this.getMonthlyInfo().subscribe((monthly) => {
      if (monthly.code) {
        return this.error.render(res, {
          ...monthly,
          svcInfo: svcInfo,
          pageInfo
        });
      }

      res.render('familydata/myt-data.familydata.share.html', {
        svcInfo,
        pageInfo,
        monthly,
        isApp: BrowserHelper.isApp(req)
      });
    });
  }

  // private getShareData = (): Observable<any> => {
  //   let requestCount = 0;
  //   return Observable.timer(0)
  //     .mergeMap(x => {
  //       return this.getShareDataInner(requestCount)
  //         .map(resp => {
  //           if (resp.code !== API_CODE.CODE_00) {
  //             return resp;
  //           }

  //           if (resp.result && resp.result.nextReqYn !== 'Y') {
  //             return resp.result;
  //           }

  //           throw resp;
  //         })
  //         .catch(e => {
  //           requestCount++;
  //           return e;
  //         });
  //     })
  //     .retryWhen(e => e.delay(3000));
  // }

  // private getShareDataInner = requestCount => {
  //   return this.apiService.request(API_CMD.BFF_06_0045, { reqCnt: String(requestCount) });
  // }

  private getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0047, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      return resp.result;
    });
  }
}
