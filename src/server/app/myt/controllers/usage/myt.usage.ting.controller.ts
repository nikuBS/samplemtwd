import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class MyTUsageTing extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0007, {}) // 팅요금상품 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = resp.result;
        const data = {
          svcInfo: svcInfo,
          usageData: usageData,
          remainDate: DateHelper.getRemainDate()
        };
        res.render('usage/myt.usage.ting.html', data);
      });
  }
}

export default MyTUsageTing;
