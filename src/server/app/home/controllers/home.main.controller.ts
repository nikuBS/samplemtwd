import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';
import { API_CMD } from '../../../types/api-command.type';
import myTUsageData from '../../../mock/myt.usage';

class HomeMain extends TwViewController {
  private apiService;

  constructor() {
    super();
    this.apiService = ApiService;
  }

  render(req: Request, res: Response, next: NextFunction) {
    // this.apiService.request(API_CMD.FAKE_GET, { postId: 1 })
    //   .subscribe((data) => {
    //     console.log('subscribe', data);
    //   }, (err) => {
    //     console.log('error', err);
    //   }, () => {
    //     console.log('complete');
    //   });

    this.apiService.request(API_CMD.FAKE_GET_1, {}, 1, 'comments')
      .subscribe((resp) => {
        console.log(myTUsageData);
        res.render('home.main.html', myTUsageData);
      });
    // res.render(__dirname + '../views/containers/home.html');
  }
}

export default HomeMain;