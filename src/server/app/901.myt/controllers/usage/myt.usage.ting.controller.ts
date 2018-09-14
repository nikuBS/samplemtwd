/**
 * FileName: myt.usage.ting.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.08.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { TING_TITLE } from '../../../../types/bff.old.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsageGraphbox from './myt.usage.graphbox.controller';

class MyTUsageTing extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0007, {})
    ).subscribe(([usageData]) => {
        if ( usageData.code === API_CODE.CODE_00 ) {
          const fomattedData = this.parseUsageData(usageData.result);
          const options = { usageData: fomattedData, svcInfo: svcInfo };
          res.render('usage/myt.usage.ting.html', options);
        } else {
          // TODO error alert
          // res.render(MYT_VIEW.ERROR, { usageData: usageData, svcInfo: svcInfo });
        }
      }
    );
  }

  private parseUsageData(usageData: any): any {
    if ( !FormatHelper.isEmpty(usageData) ) {
      usageData.map((data) => {
        MyTUsageGraphbox.convShowData(data);
        switch ( data.skipId ) {
          case 'HA':
            data.title = TING_TITLE.HA;
            data.showInfoButton = true;
            data.barClass = 'red';
            break;
          case 'CH':
            data.title =  TING_TITLE.CH;
            data.barClass = 'blue';
            break;
          case 'PR':
            data.title = TING_TITLE.PR;
            data.barClass = 'blue';
            break;
        }
      });
    }
    return usageData;
  }
}

export default MyTUsageTing;
