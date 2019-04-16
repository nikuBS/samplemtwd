/**
 * @file common.account-info.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.02
 * @desc Common > TID > 회원정보관리
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';
import EnvHelper from '../../../../utils/env.helper';
import { TID, TID_SVC_TYPE } from '../../../../types/tid.type';

/**
 * @desc TID 회원정보 관리 페이지 요청
 */
class CommonTidAccountInfo extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > TID > 회원정보관리 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_03_0007, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const params = {
          client_id: resp.result.clientId,
          client_secret: resp.result.clientSecret,
          state: resp.result.state,
          nonce: resp.result.nonce,
          service_type: TID_SVC_TYPE.GET_ACCOUNT,
          redirect_uri: this.loginService.getProtocol(req) + this.loginService.getDns(req) + '/common/tid/route',
          client_type: TID.CLIENT_TYPE,
          scope: TID.SCOPE,
          response_type: TID.RESP_TYPE
        };
        const url = this.apiService.getServerUri(API_CMD.OIDC, req) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);
        this.logger.info(this, '[redirect]', url);
        res.redirect(url);
      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }
}

export default CommonTidAccountInfo;
