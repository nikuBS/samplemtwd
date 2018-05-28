import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import ApiService from '../../../services/api.service';
import myTUsageData from '../../../mock/myt.usage';
import { API_CMD } from '../../../types/api-command.type';

class MyTUsageController extends TwViewController {
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

    // this.apiService.request(API_CMD.FAKE_GET_1, {}, 1, 'comments')
    //   .subscribe((resp) => {
    //     console.log(resp);
    //     res.render('myt.main.html', { data: resp });
    //   });
    res.render('myt.usage.html', { data: myTUsageData });
  }
}

export default MyTUsageController;
