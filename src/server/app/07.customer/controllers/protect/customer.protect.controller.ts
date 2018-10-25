/**
 * FileName: customer.protect.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class CustomerProtect extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param warningList
   * @private
   */
  private _convertWarningList (warningList): any {
    if (FormatHelper.isEmpty(warningList.content)) {
      return [];
    }

    return warningList.content;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0033, {page: 0, size: 2})
      .subscribe((warningListInfo) => {
        const isApp = BrowserHelper.isApp(req);

        if (warningListInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            code: warningListInfo.code,
            msg: warningListInfo.msg,
            title: '이용자 피해예방 센터',
            svcInfo: svcInfo
          });
        }

        res.render('protect/customer.protect.html', {
          warningList: this._convertWarningList(warningListInfo.result),
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          isApp: isApp
        });
      });
  }
}

export default CustomerProtect;
