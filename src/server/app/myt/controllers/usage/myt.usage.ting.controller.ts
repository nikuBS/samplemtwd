import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { TING_TITLE } from '../../../../types/bff-common.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTUsageTing extends TwViewController {
  constructor() {
    super();
  }

  private parseData(usageData: any): any {
    if (usageData) {
      usageData.map((data) => {
        data.title = TING_TITLE[data.skipId];
        data.isUnlimited = !isFinite(data.total);
        data.isUsedUnlimited = !isFinite(data.used);
        data.isRemainUnlimited = !isFinite(data.remained);
        data.showUsed = !data.isUsedUnlimited && FormatHelper.addComma(data.used);
        data.showRemained = !data.isRemainUnlimited && FormatHelper.addComma(data.remained);
        data.usedRatio = (!data.isUnlimited && !data.isUsedUnlimited) && (data.used / data.total * 100);
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
