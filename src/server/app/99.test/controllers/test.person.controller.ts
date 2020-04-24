/**
 * @file test.person.controller.ts
 * @author p152670
 * @since 2020.04.23
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

export default class TestPersonController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('test.person_landing.html', { svcInfo: svcInfo });
  }
}
