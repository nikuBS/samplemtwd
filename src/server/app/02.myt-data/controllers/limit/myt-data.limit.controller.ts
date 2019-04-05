/**
 * @file myt-data.limit.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTDataLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req),
      pageInfo: pageInfo
    };

    switch ( page ) {
      case 'complete':
        res.render('limit/myt-data.limit.complete.html', responseData);
        break;
      default:
        Observable.combineLatest(
          this.getLimitUserInfo()
        ).subscribe(([limitUserInfo]) => {
          const response = Object.assign(
            { limitUserInfo: limitUserInfo },
            responseData
          );

          if ( limitUserInfo && limitUserInfo.blockYn === 'N') {
            res.render('limit/myt-data.limit.html', response);
          } else {
            res.render('limit/myt-data.limit.error.html', response);
          }
        });
    }
  }

  getLimitUserInfo = () => this.apiService.request(API_CMD.BFF_06_0034, {}).map((resp) => {
    if ( resp.code === API_CODE.CODE_00 ) {
      const response = Object.assign(
        {},
        resp.result,
        {
          regularTopUpAmt: resp.result.regularTopUpAmt ? FormatHelper.numberWithCommas(resp.result.regularTopUpAmt) : ''
        });

      return response;
    } else {
      return null;
    }
  })
}

export default MyTDataLimit;
