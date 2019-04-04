/**
 * @file main.menu.settings.location.controller.ts
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.11
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';

export default class MainMenuSettingsLocation extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    this.isLocationTermAgreed(res, svcInfo, pageInfo).subscribe(
      (isAgree) => {
        if (!FormatHelper.isEmpty(isAgree)) {
          res.render('menu/settings/main.menu.settings.location.html', {
            svcInfo, pageInfo, isAgree
          });
        }
      },
      (err) => this.showError(res, svcInfo, pageInfo, err.code, err.msg)
    );
  }

  private isLocationTermAgreed(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if (resp.result.twdLocUseAgreeYn === 'Y') {
          return true;
        } else {
          return false;
        }
      }
      this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
      return null;
    });
  }

  private showError(res: Response, svcInfo: any, pageInfo: any, code: string, msg: string) {
    this.error.render(res, {
      code: code,
      msg: msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}
