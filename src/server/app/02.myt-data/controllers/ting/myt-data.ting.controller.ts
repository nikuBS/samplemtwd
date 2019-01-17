/**
 * FileName: myt-data.ting.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTDataTing extends TwViewController {
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
        res.render('ting/myt-data.ting.complete.html', responseData);
        break;
      default:
        this.getTingInfo()
          .subscribe((result) => {
            if ( result ) {
              res.render('ting/myt-data.ting.html', responseData);
            } else {
              res.render('ting/myt-data.ting.error.html');
            }
          });
    }
  }

  private getTingInfo() {
    return this.apiService.request(API_CMD.BFF_06_0020, {})
      .map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Object.assign(resp.result);
        } else {
          return null;
        }
      });
  }
}

export default MyTDataTing;
