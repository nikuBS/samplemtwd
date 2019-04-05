/**
 * FileName: home.main.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class Home extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string, pageInfo: any) {
    res.render('main.home.html', { pageInfo });
  }
}

export default Home;
