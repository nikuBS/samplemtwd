/**
 * FileName: menu.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class Menu extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any) {
    res.render('menu.html', { svcInfo });
  }
}

export default Menu;
