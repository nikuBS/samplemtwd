import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { DATA_UNIT, USER_CNT } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff-common.type';
import MyTUsage from './myt.usage.controller';
import { Observable } from 'rxjs/Observable';

class MyTUsageDataShare extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getUsageData()
    ).subscribe(([usageData]) => {
      this.renderView(res, 'usage/myt.usage.data-share.html', this.getData(usageData, svcInfo));
    });
  }

  private renderView(res: Response, view: string, data: any): any {
    if ( data.usageData.code === undefined ) {
      res.render(view, data);
    } else {
      res.render(view, data);
      // res.render(MYT_VIEW.ERROR, data);
    }
  }

  private getUsageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0004, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      usageData = this.parseData(resp.result.data);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseData(_usageData: any): any {
    const data = {
      'used': '900',
      'childList': [{
        'svcNum': '010-45**-12**',
        'svcMgmtNum': '7200XXXX',
        'feeProdId': '상품ID',
        'feeProdNm': 'LTE함께쓰기Basic',
        'auditDtm': '20150113'
      }, {
        'svcNum': '010-45**-11**',
        'svcMgmtNum': '7200XXXX',
        'feeProdId': '상품ID',
        'feeProdNm': 'LTE함께쓰기Basic',
        'auditDtm': '20150113'
      }]
    };
    data.used = FormatHelper.convDataFormat(data.used, DATA_UNIT.KB);
    if ( data.used['unit'] !== DATA_UNIT.KB ) {
      data['usedSub'] = this.getSubData(data.used);
    }
    if ( data.childList.length > 0 ) {
      data.childList.map(function (child) {
        child['auditDtm'] = DateHelper.getShortDateNoDot(child['auditDtm']);
      });
      data['korLengStr'] = (data.childList.length < 6) ? USER_CNT[data.childList.length - 1] : data.childList.length;
    }

    return data;
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
