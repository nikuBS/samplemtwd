import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import myTRoamingData from '../../../../mock/server/myt.usage.troaming-share';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT, USER_CNT } from '../../../../types/string.type';

class MyTUsageTRoamingShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    let result = myTRoamingData.result;

    this.apiService.request(API_CMD.BFF_05_0003, {}).subscribe((resp) => {
      console.log(resp);
      if ( resp.code === API_CODE.CODE_00 ) {
        result = resp.result;

      }
      res.render('usage/myt.usage.troaming-share.html', {
        result: this.parseData(result),
        svcInfo
      });
    });
  }

  private parseData(result: any): any {
    result.dataSharing.data.isUnlimit = !isFinite(result.dataSharing.data.total);
    result.dataSharing.data.remainedRatio = 100;
    result.dataSharing.data.showUsed = FormatHelper.convDataFormat(result.dataSharing.data.used, DATA_UNIT.KB);
    if ( !result.dataSharing.data.isUnlimit ) {
      result.dataSharing.data.showTotal = FormatHelper.convDataFormat(result.dataSharing.data.total, DATA_UNIT.KB);
      result.dataSharing.data.showRemained = FormatHelper.convDataFormat(result.dataSharing.data.remained, DATA_UNIT.KB);
      result.dataSharing.data.remainedRatio = result.dataSharing.data.remained / result.dataSharing.data.total * 100;
    }
    result.dataSharing.userCnt = USER_CNT[result.dataSharing.childList.length - 1];

    result.dataSharing.childList.map((child) => {
      child.showUsed = FormatHelper.convDataFormat(child.used, DATA_UNIT.KB);
    });

    result.showRemainDay = FormatHelper.convMinToDay(result.dispRemainDay);
    console.log(result);
    return result;
  }
}

export default MyTUsageTRoamingShare;
