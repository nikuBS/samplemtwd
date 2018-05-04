import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.main.html', { test1: 'home test' });
    // res.render(__dirname + '../views/containers/home.html');
  }
}

export default MainController;
