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

export default class MyTDataFamilyShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.getShareData(), this.getMonthlyInfo()).subscribe(([immediately, monthly]) => {
      const error = {
        code: immediately.code || monthly.code,
        msg: immediately.msg || monthly.msg
      };

      if (error.code) {
        return this.error.render(res, {
          ...error,
          svcInfo: svcInfo
        });
      }

      res.render('familydata/myt-data.familydata.share.html', {
        svcInfo,
        pageInfo,
        immediately,
        monthly,
        isApp: BrowserHelper.isApp(req)
      });
    });
  }

  private getShareData = (): Observable<any> => {
    return this.getShareDataInner('0').switchMap(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      if (resp.result.nextReqYn === 'N') {
        return resp.result;
      }

      return Observable.timer(3000).switchMap(() =>
        this.getShareDataInner(resp.result.reqCnt).pipe(
          map(next => {
            if (next.code !== API_CODE.CODE_00) {
              return next;
            }

            if (next.result.nextReqYn === 'Y') {
              throw next;
            } else {
              return next.result;
            }
          }),
          retryWhen(errors => {
            return errors.pipe(
              delay(3000),
              tap(val => {
                return this.getShareDataInner(val.result.reqCnt);
              })
            );
          })
        )
      );
    });
  }

  private getShareDataInner = (requestCount: string) => {
    return this.apiService.request(API_CMD.BFF_06_0045, { reqCnt: requestCount });
  }

  private getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0047, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      return resp.result;
    });
  }
}
