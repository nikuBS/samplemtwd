import Controller from '../../common/controllers/controller';
import { Request, Response, NextFunction } from 'express';

class HomeMainController extends Controller{
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.main.html', {test1: 'home test'});
    // res.render(__dirname + '../views/containers/home.html');
  }
}

export default HomeMainController;