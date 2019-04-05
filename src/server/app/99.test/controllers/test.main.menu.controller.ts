/**
 * @file test.main.menu.controller.ts
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.12.14
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class TestMainMenuController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('test.main.menu.html');
  }
}
