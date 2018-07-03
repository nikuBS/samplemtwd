/**
 * FileName: auth.account-info.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, TID_SVC_TYPE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';

class AuthTidAccountInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const params = {
      client_id: 'cec06f9d-d775-4e50-ae91-fcd95a538f8d',
      client_secret: 'eac44fbe-b96b-4f9d-9da7-0e58dfc13b90',
      client_type: 'MWEB',
      redirect_uri: 'http://localhost:3000/home',
      scope: 'openid',
      response_type: 'id_token%20token',
      state: '3646bae6eff00',
      nonce: 'df597de4c079',
      service_type: TID_SVC_TYPE.GET_ACCOUNT
    };
    const url = this.apiService.getServerUri(API_CMD.OIDC) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);

    res.redirect(url);
  }
}

export default AuthTidAccountInfo;
