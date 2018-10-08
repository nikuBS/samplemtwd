/**
 * FileName: common.settings.notifications.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.06
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/observable';
import FormatHelper from '../../../../utils/format.helper';

export default class CommonSettingsNotifications extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.checkAgreedInfo(res, svcInfo).subscribe(
      (resp) => {
        if (!FormatHelper.isEmpty(resp)) {
          res.render('settings/common.settings.notifications.html', { svcInfo: svcInfo });
        }
      },
      (err) => this.showError(res, svcInfo, err.code, err.msg)
    );
  }

  private checkAgreedInfo(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_04_0003, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      this.showError(res, svcInfo, resp.code, resp.msg);
      return null;
    });
  }

  private showError(res: Response, svcInfo: any, code: string, msg: string) {
    this.error.render(res, {
      code: code,
      msg: msg,
      svcInfo: svcInfo
    });
  }
}
