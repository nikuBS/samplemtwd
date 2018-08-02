import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_VIEW } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import MyTUsageGraphbox from './myt.usage.graphbox.controller';

class MyTUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0001, {})
      // this.getUsageData()
    ).subscribe(([usageData]) => {
        if ( usageData.code === API_CODE.CODE_00 ) {
          const fomattedData = this.parseUsageData(usageData.result);
          const options = { usageData: fomattedData, svcInfo: svcInfo, remainDate: DateHelper.getRemainDate() };
          res.render('usage/myt.usage.html', options);
        } else {
          res.render(MYT_VIEW.ERROR, { usageData: usageData, svcInfo: svcInfo });
        }
      }
    );
  }

  // TODO 삭제예정. 참조하는 곳 제거 필요
  public renderView(res: any, url: any, data: any): any {

  }

  private parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    return usageData;
  }
}

export default MyTUsage;
