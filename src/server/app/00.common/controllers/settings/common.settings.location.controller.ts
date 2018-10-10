/**
 * FileName: common.settings.location.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.11
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export default class CommonSettingsLocation extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.isLocationTermAgreed(res, svcInfo).subscribe(
      (isAgree) => {
        res.render('settings/common.settings.location.html', {
          svcInfo: svcInfo ,
          isAgree: isAgree
        });
      },
      (err) => this.showError(res, svcInfo, err.code, err.msg)
    );
  }

  private isLocationTermAgreed(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if (resp.result.twdLocUseAgreeYn === 'Y') {
          return true;
        } else {
          return false;
        }
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
