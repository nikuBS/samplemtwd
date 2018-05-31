import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../types/api-command.type';
import myTUsageData from '../../../mock/myt.usage';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { UNIT } from '../../../types/bff-common.type';

class HomeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // this.apiService.request(API_CMD.FAKE_GET, { postId: 1 })
    //   .subscribe((data) => {
    //     console.log('subscribe', data);
    //   }, (err) => {
    //     console.log('error', err);
    //   }, () => {
    //     console.log('complete');
    //   });

    console.log(svcInfo);
    console.log(FormatHelper.convUnit(3.2, 'GB', 'KB'));

    const remainDate = DateHelper.getRemainDate();
    this.apiService.request(API_CMD.SESSION_CHECK, {})
      .subscribe((resp) => {
        console.log(resp);
      });

    const usageData = this.parseData(myTUsageData.result);
    console.log(usageData);
    res.render('home.main.html', {
      usageData,
      svcInfo,
      remainDate
    });
    // this.apiService.request(API_CMD.BFF_05_0001, {})
    //   .subscribe((resp) => {
    //     console.log(resp);
    //     // console.log(myTUsageData);
    //     res.render('home.main.html', myTUsageData);
    //   });
    // res.render(__dirname + '../views/containers/home.html');
  }

  private parseData(usageData: any): any {
    usageData.data.map((data) => {
      data.showTotal = FormatHelper.convUnit(data.total, UNIT[data.unit]);
      data.showUsed = FormatHelper.convUnit(data.used, UNIT[data.unit]);
      data.showRemained = FormatHelper.convUnit(data.remained, UNIT[data.unit]);
      data.usedRatio = data.used / data.total * 100;
    });
    return usageData;
  }

}

export default HomeMain;
