/**
 * @file 나와 가까운 매장 페이지 처리
 * @author Hakjoon sim
 * @since 2018-10-29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerAgentsearchNear extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    /* 앱 이면서 비 로그인인 경우 로그인 페이지로 리다이렉트 */
    if(BrowserHelper.isApp(req) && !svcInfo){
      res.redirect("/common/tid/login?target=/customer/agentsearch/near");
      }

    res.render('agentsearch/customer.agentsearch.near.html', { svcInfo, pageInfo });
  }
}

export default CustomerAgentsearchNear;
