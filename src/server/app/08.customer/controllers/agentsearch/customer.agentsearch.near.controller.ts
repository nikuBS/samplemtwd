/**
 * @file 나와 가까운 매장 페이지 처리
 * @author Hakjoon sim
 * @since 2018-10-29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {LOGIN_TYPE} from '../../../../types/bff.type';

class CustomerAgentsearchNear extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    /* 로그인인 경우 - 이면 아래 if조건을 타고 아니면 true를 전달해서 실행 - OP002-2058  */
    let acceptAgeObserver = new Observable(subscriber => { subscriber.next(true); } );
    // if(BrowserHelper.isApp(req) && !FormatHelper.isEmpty(svcInfo.svcMgmtNum)){
    if (svcInfo && (svcInfo.loginType !== LOGIN_TYPE.EASY)) {
      // 로그인이며 간편로그인이 아닌 사용자인 경우에만 나이조회(모웹,웹 구분 없음), 간편로그인인 경우는 위치정보 동의가 되지 않기 때문에
      acceptAgeObserver = this.checkAge(svcInfo);
    }
        
    acceptAgeObserver.subscribe((isAcceptAge) => {

      /* 앱 이면서 비 로그인인 경우 로그인 페이지로 리다이렉트 - 공통에서 가이드 */
      if (BrowserHelper.isApp(req) && !svcInfo) {
        // res.redirect('/common/tid/login?target=/customer/agentsearch/near');
        res.render('error.login-block.html', { target: req.baseUrl + req.url });
      } else if (BrowserHelper.isApp(req) && (svcInfo.loginType === LOGIN_TYPE.EASY)) {
        // 앱이면서 간편로그인인 경우  간편로그인 없는 일반 로그인 페이지로 이동
        res.render('error.slogin-fail.html', { target: req.baseUrl + req.url });
      } else {
        res.render('agentsearch/customer.agentsearch.near.html', { svcInfo, pageInfo, isAcceptAge });
      }

    });  // end of acceptAgeObserver.subscribe((isAcceptAge) => {
  }
  

  /**
   * @function
   * @desc 만 나이 리턴
   * @param  {any} svcInfo - 사용자 정보
   * @returns string
   */
  private checkAge(svcInfo: any): any {

    // this.logger.info(this, '[ 나이체크 함수 탔는지 확인 ]');
    return this.apiService.request(API_CMD.BFF_08_0080, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // this.logger.info(this, '[ 현재 나이 정보는 resp.result.age] : ', resp.result.age);
        return resp.result.age >= 14 ? true : false;
      }

      this.error.render(resp, {
        title : 'checkAge14',
        code: resp.code,
        msg: resp.msg,
        // pageInfo: pageInfo,
        svcInfo
      });

      return undefined;
    });
  } // end of checkAge



}

export default CustomerAgentsearchNear;
