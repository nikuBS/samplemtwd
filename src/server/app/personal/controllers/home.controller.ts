import Controller from '../../common/controllers/controller';
import HomeModel from '../models/home.model';
import { Request, Response, NextFunction } from 'express';

class HomeController extends Controller{
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.html', new HomeModel());
    // res.render(__dirname + '../views/containers/home.html');
  }
}

export default HomeController;