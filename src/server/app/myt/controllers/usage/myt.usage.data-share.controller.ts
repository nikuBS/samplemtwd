import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD } from '../../../../types/api-command.type';
import { USER_CNT } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff-common.type';
import MyTDataSharingdata from '../../../../mock/server/myt.usage.data-sharing';

class MyTUsageDataShare extends TwViewController {

  constructor() {
    super();
  }

  private parseData(usageData: any): any {
    usageData.userCnt = USER_CNT[usageData.childList.length - 1];
    usageData.showTotal = FormatHelper.convDataFormat(usageData.data.used, UNIT[usageData.data.unit]);
    usageData.childList.map((data) => {
      data.setDate = DateHelper.getShortDate(data.auditDtm);
      data.showUsed = FormatHelper.convDataFormat(data.used, UNIT[data.unit]);
    });
    return usageData;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_05_0004, {}) // 데이터 함께쓰기 사용량 조회
      .subscribe((resp) => {
        console.log(resp);
        const usageData = this.parseData(MyTDataSharingdata.result);
        const data = {
          svcInfo: svcInfo,
          usageData: usageData
        };
        res.render('usage/myt.usage.data-share.html', data);
      });
  }
}

export default MyTUsageDataShare;
