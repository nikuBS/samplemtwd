/**
 * FileName: myt.usage.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.08.02
 */
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
          const fomattedData = this.parseUsageData(usageData.result, svcInfo);
          let strDate;
          if ( svcInfo.svcAttrCd !== 'S3' ) {
            strDate = DateHelper.getRemainDate();
          } else {
            const today = DateHelper.getCurrentDate();
            strDate = `${DateHelper.getShortDateWithFormat(today, 'YYYY.MM.01')} ~ ${DateHelper.getShortDate(today)}`;
          }
          const options = { usageData: fomattedData, svcInfo: svcInfo, remainDate: strDate };
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

  public parseUsageData(usageData: any, svcInfo: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    // 집전화는 balance의 첫번째 레코드가 음성 → (1개 레코드일 경우 음성, 2개 레코드일 경우 첫번째가 음성/두번째가 SMS)
    if ( svcInfo.svcAttrCd === 'S3' && usageData.balance ) {
      usageData.voice = usageData.balance[0] ? [usageData.balance[0]] : [];
      usageData.sms = usageData.balance[1] ? [usageData.balance[1]] : [];
    }
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
