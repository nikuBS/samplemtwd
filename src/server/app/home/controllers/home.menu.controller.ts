import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class HomeMenu extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.menu.html');
  }
}

export default HomeMenu;
