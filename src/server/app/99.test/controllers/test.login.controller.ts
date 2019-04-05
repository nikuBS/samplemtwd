/**
 * @file test.login.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class TestLoginController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('test.login.html', { svcInfo: svcInfo });
  }
}
