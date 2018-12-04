/**
 * FileName: common.tid.signup-foreigner.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';
import EnvHelper from '../../../../utils/env.helper';
import { TID, TID_SVC_TYPE } from '../../../../types/tid.type';

class CommonTidSignUpForeigner extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_03_0007, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const params = {
          client_id: resp.result.clientId,
          client_secret: resp.result.clientSecret,
          state: resp.result.state,
          nonce: resp.result.nonce,
          service_type: TID_SVC_TYPE.SIGN_UP,
          redirect_uri: 'http://' + this.loginService.getDns() +
          '/common/member/login/route?target=/main/home=' + resp.result.state,
          client_type: TID.CLIENT_TYPE,
          scope: TID.SCOPE,
          response_type: TID.RESP_TYPE,
          frgnr_yn: 'Y'
        };
        const url = this.apiService.getServerUri(API_CMD.OIDC) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);
        this.logger.info(this, '[redirect]', url);
        res.redirect(url);
      } else {
        res.send('login fail');
      }
    });
  }
}

export default CommonTidSignUpForeigner;
