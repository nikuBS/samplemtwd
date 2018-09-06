/**
 * FileName: auth.tid.logout.controller.ts
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

class AuthTidLogout extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const target = req.query.target || '/auth/logout/complete';
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_03_0007, {}),
      this.apiService.request(API_CMD.LOGOUT_BFF, {})
    ).subscribe(([key, logout]) => {
      if ( key.code === API_CODE.CODE_00 ) {
        const params = {
          client_id: key.result.clientId,
          redirect_uri: EnvHelper.getEnvironment('DOMAIN') +
            '/auth/logout/route?target=' + target,
          client_type: TID.CLIENT_TYPE,
        };
        const url = this.apiService.getServerUri(API_CMD.LOGOUT) + API_CMD.LOGOUT.path + ParamsHelper.setQueryParams(params);
        this.logger.info(this, '[redirect]', url);
        res.redirect(url);
      } else {
        res.send('login fail');
      }
    });
  }
}

export default AuthTidLogout;
