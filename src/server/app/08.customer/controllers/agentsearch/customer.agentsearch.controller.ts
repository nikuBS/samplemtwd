/**
 * @file 지점/대리점 검색 화면 처리
 * @author Hakjoon sim
 * @since 2018-10-16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {NODE_ERROR_MSG} from '../../../../types/string.type';
import { NextFunction } from 'connect';
import {LOGIN_TYPE} from '../../../../types/bff.type';

class CustomerAgentsearch extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // this.logger.info(this, '[ 현재 svcInfo 는? :  ]', svcInfo);
    // this.logger.info(this, '[ 현재 서비스 관리 번호는? :  ]', svcInfo.svcMgmtNum);

    // 20-06-09 OP002-8777 : 미로그인 상태 시 로그인 페이지로 이동
    /*if (!svcInfo) {
      res.render('error.login-block.html', { target: req.baseUrl + req.url });
      return;
    }*/
    // 20-10-22 OP002-10922 비 로그인/간편로그인 사용자도 진입가능
    if (!svcInfo || svcInfo.loginType === LOGIN_TYPE.EASY) {
      res.render('agentsearch/customer.agentsearch.html', { /*isSearch: false,*/ svcInfo: {}, pageInfo, isAcceptAge: 'Y' });
      return;
    }

    /* true를 전달해서 실행 - OP002-2058  */
    // 만 나이 확인
    this.apiService.request(API_CMD.BFF_08_0080, {}).subscribe((resp) => {
      const {code, result} = resp;
      const isAcceptAge = (code !== API_CODE.CODE_00 || FormatHelper.isEmpty(result.age)) ? undefined : result.age  >= 14 ? 'Y' : 'N';
      if (svcInfo && FormatHelper.isEmpty(isAcceptAge)) {
        // 앱, 웹 구분없이 로그인 했으나 나이가 없는 경우 에러 페이지로 이동
        return this.error.render(res, {
          code: API_CODE.NODE_1010,
          msg: NODE_ERROR_MSG[API_CODE.NODE_1010],
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
      res.render('agentsearch/customer.agentsearch.html', { /*isSearch: false,*/ svcInfo, pageInfo, isAcceptAge });
    });
  }
}

export default CustomerAgentsearch;
