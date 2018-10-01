/**
 * FileName: myt-data.gift.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.10
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTDataGift extends TwViewController {
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
      case 'sms':
        res.render('gift/myt-data.gift.sms.html', responseData);
        break;
      case 'complete':
        res.render('gift/myt-data.gift.complete.html', responseData);
        break;
      default:
        Observable.combineLatest(
          this.getGiftAutoList()
        ).subscribe(([autoList]) => {
          const response = Object.assign(
            {},
            { autoList: autoList },
            responseData
          );

          res.render('gift/myt-data.gift.html', response);
        });
    }
  }

  private getGiftAutoList() {
    return this.apiService.request(API_CMD.BFF_06_0006, {})
      .map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          let result = resp.result;
          result = result.map(item => {
            item.svcNum = FormatHelper.conTelFormatWithDash(item.svcNum);
            return item;
          });

          return result;
        } else {
          return null;
        }
      });
  }
}

export default MyTDataGift;
