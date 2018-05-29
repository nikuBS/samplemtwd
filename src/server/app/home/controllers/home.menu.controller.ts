import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';
import { API_CMD } from '../../../types/api-command.type';

class HomeMenu extends TwViewController {
  private apiService;

  constructor() {
    super();
    this.apiService = ApiService;
  }

  render(req: Request, res: Response, next: NextFunction) {
    res.render('home.menu.html');
  }
}

export default HomeMenu;