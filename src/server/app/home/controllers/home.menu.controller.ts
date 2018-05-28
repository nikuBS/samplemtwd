import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';
import { API_CMD } from '../../../types/api-command.type';

class MainController extends TwViewController {
  private apiService;

  constructor() {
    super();
    this.apiService = ApiService;
  }

  render(req: Request, res: Response, next: NextFunction) {
    this.apiService.request(API_CMD.FAKE_GET_1, {}, 1, 'comments')
      .subscribe((resp) => {
        console.log(resp);
        res.render('home.menu.html', { data: resp });
      });
  }
}

export default MainController;