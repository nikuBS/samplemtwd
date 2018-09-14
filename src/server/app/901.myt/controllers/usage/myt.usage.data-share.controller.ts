/**
 * FileName: myt.usage.data-share.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { DATA_UNIT, USER_CNT } from '../../../../types/string.old.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff.old.type';
import MyTUsageGraphbox from './myt.usage.graphbox.controller';
import { Observable } from 'rxjs/Observable';

class MyTUsageDataShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      res.render('usage/myt.usage.data-share.html', this.getData(usageData, svcInfo));
    });
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0004, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      usageData = this.parseData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseData(result: any): any {
    // const data = {
    //   'used': '900',
    //   'childList': [{
    //     'svcNum': '010-45**-12**',
    //     'svcMgmtNum': '7200XXXX',
    //     'feeProdId': '상품ID',
    //     'feeProdNm': 'LTE함께쓰기Basic',
    //     'auditDtm': '20150113'
    //   }, {
    //     'svcNum': '010-45**-11**',
    //     'svcMgmtNum': '7200XXXX',
    //     'feeProdId': '상품ID',
    //     'feeProdNm': 'LTE함께쓰기Basic',
    //     'auditDtm': '20150113'
    //   }]
    // };
    const data = result.data;
    const childList = result.childList;
    data.used = FormatHelper.convDataFormat(data.used, DATA_UNIT.KB);
    if ( data.used['unit'] !== DATA_UNIT.KB ) {
      data['usedSub'] = this.getSubData(data.used);
    }
    if ( childList.length > 0 ) {
      childList.map(function (child) {
        child['auditDtm'] = DateHelper.getShortDateNoDot(child['auditDtm']);
      });
      data['korLengStr'] = (childList.length < 6) ? USER_CNT[childList.length - 1] : childList.length;
    }

    return result;
  }


  private getSubData(data: any): any {
    const subData = {
      data: FormatHelper.convNumFormat(data.data.replace(/,/gi, '') * 1024)
    };
    switch ( data.unit ) {
      case DATA_UNIT.GB:
        subData['unit'] = DATA_UNIT.MB;
        break;
      case DATA_UNIT.MB:
        subData['unit'] = DATA_UNIT.KB;
        break;
    }
    return subData;

  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo,
      usageData
    };
  }
}

export default MyTUsageDataShare;
