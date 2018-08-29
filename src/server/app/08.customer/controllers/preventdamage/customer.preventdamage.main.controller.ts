/**
 * FileName: customer.preventdamage.main.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class CustomerPreventdamageMain extends TwViewController {
  constructor() {
    super();
  }

  private _convertData (data): any {
    return (data.code !== '00') ? [] : data.result.content;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0033, {page: 0, size: 2})
      .subscribe((data) => {
        if (FormatHelper.isEmpty(data)) {
          return res.redirect('/customer');
        }

        res.render('preventdamage/customer.preventdamage.main.html', {
          svcInfo: svcInfo,
          isApp: BrowserHelper.isApp(req),
          latestWarningList: this._convertData(data)
        });
      });
  }
}

export default CustomerPreventdamageMain;
