import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import myTUsageData from '../../../../mock/myt.usage';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD } from '../../../../types/api-command.type';
import { SVC_CD } from '../../../../types/bff-common.type';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  private makeSvcCdObj(svcCd: string) {
    const svcCdObj = { 'svcCd': SVC_CD[svcCd] };
    return svcCdObj;
  }

  private assignHeaderObj(svcInfo: any) {
    const changedObj = this.makeSvcCdObj(svcInfo.svcCd);
    return Object.assign({}, svcInfo, changedObj);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const copySvcInfo = this.assignHeaderObj(svcInfo);
    this.apiService.request(API_CMD.BFF_05_0001, {}) // 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const data = {
          svcInfo: copySvcInfo,
          response: myTUsageData, // mock data
          remainDate: DateHelper.getRemainDate()
        };
        res.render('usage/myt.usage.html', data);
      });
  }
}

export default MyTUsage;
