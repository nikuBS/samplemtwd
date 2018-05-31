import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import myTUsageData from '../../../mock/myt.usage';
import DateHelper from '../../../utils/date.helper';

class HomeMain extends TwViewController {
  constructor() {
    super();
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

    // console.log(DateHelper.getRemainDate());

    this.apiService.request(API_CMD.GET_USAGE, {})
      .subscribe((resp) => {
        console.log(resp);
        // console.log(myTUsageData);
        res.render('home.main.html', myTUsageData);
      });
    // res.render(__dirname + '../views/containers/home.html');
  }
}

export default HomeMain;