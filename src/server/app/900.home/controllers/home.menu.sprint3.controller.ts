// Author Ara Jo (araara.jo@sk.com)

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class HomeMenuSprint3 extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.menu.sprint3.html');
  }
}

export default HomeMenuSprint3;
