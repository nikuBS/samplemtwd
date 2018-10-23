/**
 * FileName: myt-data.cookiz.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

class MyTDataCookiz extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch ( page ) {
      case 'complete':
        res.render('cookiz/myt-data.cookiz.complete.html', responseData);
        break;
      default:
        Observable.combineLatest(
          this.getSubscriptionInfo()
        ).subscribe(([subscriptions]) => {
          const response = Object.assign(
            responseData,
            { subscriptions: subscriptions }
          );

          if ( subscriptions.currentTopUpLimit === '0' ) {
            res.render('cookiz/myt-data.cookiz.blocked.html', response);
          } else if ( subscriptions ) {
            res.render('cookiz/myt-data.cookiz.html', response);
          } else {
            res.render('cookiz/myt-data.cookiz.error.html', response);
          }
        });
    }
  }

  private getSubscriptionInfo() {
    return this.apiService.request(API_CMD.BFF_06_0028, {})
      .map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Object.assign(resp.result, { regularTopUpAmt: FormatHelper.numberWithCommas(resp.result.regularTopUpAmt) });
        } else {
          return null;
        }
      });
  }
}

export default MyTDataCookiz;
