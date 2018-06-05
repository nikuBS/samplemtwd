import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {SVC_CD} from '../../../../types/bff-common.type';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class MyTUsage24hour50discount extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0008, {}) // 24시간 데이터 50% 할인 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = resp.result;
        const data = {
          svcInfo: svcInfo,
          usageData: usageData,
          remainDate: DateHelper.getRemainDate()
        };
        res.render('usage/myt.usage.24hours-50discount.html', data);
      });
  }
}

export default MyTUsage24hour50discount;
