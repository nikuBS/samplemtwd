/**
 * FileName: common.settings.notifications.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.06
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

export default class CommonSettingsNotifications extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.checkNotiAgreedInfo(res, svcInfo),
      this.checkTworldAgreedInfo(res, svcInfo)
    ).subscribe(
      ([respNoti, respTworld]) => {
        if (FormatHelper.isEmpty(respNoti) || FormatHelper.isEmpty(respTworld)) {
          return;
        }

        res.render('settings/common.settings.notifications.html', {
          svcInfo: svcInfo,
          isServiceOn: respNoti.tnotiInfoRcvAgreeYn === 'Y' ? true : false,
          isRecommendOn: respNoti.tnotiMrktRcvAgreeYn === 'Y' ? true : false,
          isAdOn: respTworld.twdAdRcvAgreeYn === 'Y' ? true : false,
          isPrivateInfoOn: respTworld.twdInfoRcvAgreeYn === 'Y' ? true : false,
          isLocationOn: respTworld.twdLocUseAgreeYn === 'Y' ? true : false
        });
      },
      (err) => this.showError(res, svcInfo, err.code, err.msg)
    );
  }

  private checkNotiAgreedInfo(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0023, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      this.showError(res, svcInfo, resp.code, resp.msg);
      return null;
    });
  }

  private checkTworldAgreedInfo(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
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
