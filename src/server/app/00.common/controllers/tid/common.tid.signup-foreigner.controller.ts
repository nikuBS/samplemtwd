/**
 * @file 외국인 가입시 TID 외국인 가입안내로 이동
 * @author Hakjoon Sim
 * @since 2018-07-09
 * @desc Common > TID > 외국인회원가입
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import ParamsHelper from '../../../../utils/params.helper';
import EnvHelper from '../../../../utils/env.helper';
import { TID, TID_SVC_TYPE } from '../../../../types/tid.type';

/**
 * @desc TID 외국인회원가입 페이지 요청
 */
class CommonTidSignUpForeigner extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > TID > 외국인회원가입 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // TID 연동 key 조회
    this.apiService.request(API_CMD.BFF_03_0007, {}).subscribe((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        const params = {
          client_id: resp.result.clientId,
          client_secret: resp.result.clientSecret,
          state: resp.result.state,
          nonce: resp.result.nonce,
          service_type: TID_SVC_TYPE.SIGN_UP,
          redirect_uri: this.loginService.getProtocol(req) + this.loginService.getDns(req) +
            '/common/member/signup/route',
          client_type: TID.CLIENT_TYPE,
          scope: TID.SCOPE,
          response_type: TID.RESP_TYPE,
          frgnr_yn: 'Y' // 외국인 표기를 query param에 추가
        };
        const url = this.apiService.getServerUri(API_CMD.OIDC, req) + API_CMD.OIDC.path + ParamsHelper.setQueryParams(params);
        this.logger.info(this, '[redirect]', url);
        res.redirect(url);
      } else {
        res.redirect('/common/member/login/fail?errorCode=' + resp.code);
      }
    });
  }
}

export default CommonTidSignUpForeigner;
