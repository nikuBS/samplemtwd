/**
 * FileName: commmon.tid.logout.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';
import EnvHelper from '../../../../utils/env.helper';
import { TID, TID_SVC_TYPE } from '../../../../types/tid.type';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { TID_LOGOUT } from '../../../../types/common.type';
import { TID_MSG } from '../../../../types/string.type';

class CommonTidLogout extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const type = +req.query.type || TID_LOGOUT.DEFAULT;
    const errorCode = req.query.errorCode || '';
    const routeUrl = type === TID_LOGOUT.DEFAULT ? '/common/member/logout/complete' :
      '/common/member/login/fail?errorCode=' + errorCode;
    let clientId = '';

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_03_0007, {}),
      this.apiService.request(API_CMD.BFF_03_0001, {}),
    ).switchMap(([key, bff_logout]) => {
      if ( key.code === API_CODE.CODE_00 ) {
        clientId = key.result.clientId;
        return this.loginService.logoutSession();
      } else {
        throw key;
      }
    }).subscribe((resp) => {
      const params = {
        client_id: clientId,
        redirect_uri: this.loginService.getProtocol() + this.loginService.getDns() +
          '/common/member/logout/route?target=' + encodeURIComponent(routeUrl),
        sso_logout_redirect_uri: this.loginService.getProtocol() + this.loginService.getDns() +
          '/main/home',
        client_type: TID.CLIENT_TYPE,
      };

      if ( type === TID_LOGOUT.LOGIN_FAIL ) {
        Object.assign(params, {
          page_title: TID_MSG.LOGIN_FAIL,
          page_comment: errorCode,
        });
      }

      const url = this.apiService.getServerUri(API_CMD.LOGOUT) + API_CMD.LOGOUT.path + ParamsHelper.setQueryParams(params);


      this.logger.info(this, '[redirect]', url);
      res.redirect(url);
    }, (err) => {
      this.error.render(res, {
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    });
  }
}

export default CommonTidLogout;
