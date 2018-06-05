import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { TING_TITLE } from '../../../../types/bff-common.type';
import {SKIP_NAME} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTUsageTing extends TwViewController {
  constructor() {
    super();
  }

  private parseData(usageData: any): any {
    if (usageData) {
      usageData.map((data) => {
        data.title = TING_TITLE[data.skipId];
        data.isUnlimited = data.total === SKIP_NAME.UNLIMIT;
        data.showTotal = data.isUnlimited ? data.total : FormatHelper.convNumFormat(data.total);
        data.showUsed = FormatHelper.convNumFormat(data.used);
        data.showRemained = FormatHelper.convNumFormat(data.remained);
        data.usedRatio = (!data.isUnlimited) && (data.used / data.total * 100);
        data.showRemainedRatio = data.isUnlimited ? 100 : 100 - data.usedRatio;
        data.barClassName = data.isUnlimited ? 'progressbar-type02' : 'progressbar-type01';
      });
    }
    return usageData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0007, {}) // 팅요금상품 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = this.parseData(resp.result);
        const data = {
          svcInfo: svcInfo,
          usageData: usageData
        };
        res.render('usage/myt.usage.ting.html', data);
      });
  }
}

export default MyTUsageTing;
