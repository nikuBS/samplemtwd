import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DataLimit from '../../../../mock/server/myt.data-limit';

class MyTUsageDataLimit extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let dataLimit = DataLimit.result;
    this.apiService.request(API_CMD.BFF_05_0006, {}).subscribe((resp) => {
      console.log(resp);
      if ( resp.code === API_CODE.CODE_00 ) {
        dataLimit = resp.result;
      }
      res.render('usage/myt.usage.data-limit.html', {
        dataLimit: this.parseData(dataLimit),
        svcInfo
      });
    });
  }

  private parseData(data: any): any {
    data.usedRatio = data.used / data.total * 100;

    return data;
  }
}

export default MyTUsageDataLimit;
