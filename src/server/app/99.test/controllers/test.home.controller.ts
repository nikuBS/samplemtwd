/**
 * FileName: test.home.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.11.22
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class TestHome extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('test.home.html', );
  }
}

export default TestHome;
