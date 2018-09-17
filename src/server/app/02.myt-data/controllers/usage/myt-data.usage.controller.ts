/**
 * FileName: myt-data.usage.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';
import { MYT_VIEW } from '../../../../types/string.type';
import MyTUsageGraphbox from './myt-data.usage.graphbox.controller';
import FormatHelper from '../../../../utils/format.helper';
import { T_O_PLAN_BASE_DATA, T_O_PLAN_SHARE_DATA } from '../../../../types/bff.type';

class MyTDataUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0001, {}),
      this.apiService.request(API_CMD.BFF_05_0002, {})
      // this.getUsageData()
    ).subscribe(([usageData, balanceAddOns]) => {
        if ( usageData.code === API_CODE.CODE_00 ) {
          const fomattedData = this.parseUsageData(usageData.result, svcInfo);
          let strDate;
          if ( svcInfo.svcAttrCd !== 'S3' ) {
            strDate = DateHelper.getRemainDate();
          } else {
            const today = DateHelper.getCurrentDate();
            strDate = `${DateHelper.getShortDateWithFormat(today, 'YYYY.MM.01')} ~ ${DateHelper.getShortDate(today)}`;
          }
          const options = { usageData: fomattedData, svcInfo: svcInfo, remainDate: strDate, balanceAddOns };
          console.log('~~~~~~~~~~~options', options);
          res.render('usage/myt-data.usage.html', options);
        } else {
          res.render(MYT_VIEW.ERROR, { usageData: usageData, svcInfo: svcInfo });
        }
      }
    );
  }


  public parseUsageData(usageData: any, svcInfo: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    // 집전화는 balance의 첫번째 레코드가 음성 → (1개 레코드일 경우 음성, 2개 레코드일 경우 첫번째가 음성/두번째가 SMS)
    if ( svcInfo.svcAttrCd === 'S3' && usageData.balance ) {
      usageData.voice = usageData.balance[0] ? [usageData.balance[0]] : [];
      usageData.sms = usageData.balance[1] ? [usageData.balance[1]] : [];
    }
    if ( usageData.data ) {
      // T/O플랜 통합공유 데이터가 있으면 T/O플랜 기본제공 데이터의 sharedData에 넣는다.
      const tPlanSharedData = this.getTPlanSharedData(usageData.data);
      if ( tPlanSharedData ) {
        usageData.data = usageData.data.filter((_data) => {
          return _data.skipId !== tPlanSharedData.skipId;
        });
        const tPlanBaseData = this.getTPlanBaseData(usageData.data);
        tPlanBaseData.sharedData = tPlanSharedData;
      }
    }
    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~usageData', usageData);
    return usageData;
  }

  private getTPlanSharedData(dataArray: any): any {
    return this.getDataInTarget(T_O_PLAN_SHARE_DATA, dataArray);
  }

  private getTPlanBaseData(dataArray: any): any {
    return this.getDataInTarget(T_O_PLAN_BASE_DATA, dataArray);
  }

  private getDataInTarget(target: any, dataArray: any): any {
    let data;
    target.map((tOPlanBaseData) => {
      if ( !data ) {
        data = dataArray.find((_data) => {
          return tOPlanBaseData === _data.skipId;
        });
      }
    });
    return data;
  }
}

export default MyTDataUsage;
