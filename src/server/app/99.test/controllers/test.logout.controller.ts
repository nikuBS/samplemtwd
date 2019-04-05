/**
 * @file test.logout.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

export default class TestLogoutController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_03_0001, {}),
      this.loginService.logoutSession(req, res)
    ).subscribe(([logout, session]) => {
      res.render('test.logout.html', { result: logout });
    });

  }
}
