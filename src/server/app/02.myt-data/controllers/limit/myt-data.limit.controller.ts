/**
 * FileName: myt-data.limit.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTDataLimit extends TwViewController {
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
        res.render('gift/myt-data.gift.complete.html', responseData);
        break;
      default:
        Observable.combineLatest(
          this.getLimitUserInfo()
        ).subscribe(([limitUserInfo]) => {
          const response = Object.assign(
            {},
            { limitUserInfo: limitUserInfo },
            responseData
          );
          res.render('limit/myt-data.limit.html', response);
        });
    }
  }

  private getLimitUserInfo() {
    return this.apiService.request(API_CMD.BFF_06_0034, {})
      .map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;

          return result;
        } else {
          return null;
        }
      });
  }
}

export default MyTDataLimit;
