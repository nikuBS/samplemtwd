/**
 * FileName: auth.tid.signup-foreigner.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE, TID_SVC_TYPE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';
import EnvHelper from '../../../../utils/env.helper';

class AuthTidSignUpForeigner extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const params = {
      client_id: 'df3c0ea4-ea4d-439f-8e2f-01f683af0c95',
      client_secret: 'eac44fbe-b96b-4f9d-9da7-0e58dfc13b90',
      state: '3646bae6eff00',
      nonce: 'df597de4c079',
      service_type: TID_SVC_TYPE.SIGN_UP,
      redirect_uri: EnvHelper.getEnvironment('TID_REDIRECT') + '/home',
      client_type: 'MWEB',
      scope: 'openid',
      response_type: 'id_token%20token',
      frgnr_yn: 'Y'
    };
    this.apiService.request(API_CMD.BFF_03_0007, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        params.client_id = resp.result.clientId;
        params.client_secret = resp.result.clientSecret;
        params.nonce = resp.result.nonce;
        params.state = resp.result.state;
      }
      const url = this.apiService.getServerUri(API_CMD.OIDC) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);
      this.logger.info(this, '[redirect]', url);
      res.redirect(url);
    });
  }
}

export default AuthTidSignUpForeigner;
