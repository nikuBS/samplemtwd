/**
 * FileName: auth.login.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE, TID_SVC_TYPE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';

class AuthTidLogin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const params = {
      client_id: 'df3c0ea4-ea4d-439f-8e2f-01f683af0c95',
      client_secret: 'eac44fbe-b96b-4f9d-9da7-0e58dfc13b90',
      state: '3646bae6eff00',
      nonce: 'df597de4c079',
      service_type: TID_SVC_TYPE.ID_LOGIN,
      redirect_uri: 'http://localhost:3000',
      client_type: 'MWEB',
      scope: 'openid',
      response_type: 'id_token%20token',
    };
    this.apiService.request(API_CMD.BFF_03_0007, { chnl: 'mo-web' }).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        params.client_id = resp.result.clientId;
        params.client_secret = resp.result.clientSecret;
        params.nonce = resp.result.nonce;
        params.state = resp.result.state;
      }
      const url = this.apiService.getServerUri(API_CMD.OIDC) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);
      res.redirect(url);
    });
  }
}

export default AuthTidLogin;
