import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import MyTUsage from './myt.usage.controller';
import DateHelper from '../../../../utils/date.helper';
import { DATA_UNIT, USER_CNT } from '../../../../types/string.type';

class MytUsageBandDataSharingsController extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // Observable.combineLatest(
    //   this.getUsageData()
    // ).subscribe(([usageData]) => {
    //   this.myTUsage.renderView(res, 'usage/myt.usage.band-data-sharings.html', this.getData(usageData, svcInfo));
    // });

    const usageData = this.getResult({
      'code': '00',
      'msg': '',
      'result': {
        data: {
          used: '300000'
        },
        'childList': [{
          'svcMgmtNum': '722xxxxxx',
          'svcNum': '01012345678',
          'feeProdId': 'NA000xxx',
          'feeProdNm': 'LTE함께쓰기',
          'auditDtm': '20141010'
        }, {
          'svcMgmtNum': '722xxxxxx',
          'svcNum': '01012345678',
          'feeProdId': 'NA000xxx',
          'feeProdNm': 'LTE함께쓰기',
          'auditDtm': '20141010'
        }, {
          'svcMgmtNum': '722xxxxxx',
          'svcNum': '01012345678',
          'feeProdId': 'NA000xxx',
          'feeProdNm': 'LTE함께쓰기',
          'auditDtm': '20141010'
        }]
      }
    }, {});
    this.myTUsage.renderView(res, 'usage/myt.usage.band-data-sharings.html', this.getData(usageData, svcInfo));
  }

  // private getUsageData(): Observable<any> {
  //   return this.apiService.request(API_CMD.BFF_05_0078, {}).map((resp) => {
  //     return this.getResult(resp, {});
  //   });
  // }

  private getResult(resp: any, usageData: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      usageData = this.parseUsageData(resp.result);
    } else {
      usageData = resp;
    }
    return usageData;
  }

  private parseUsageData(result: any): any {
    const data = result.data;
    const childList = result.childList;
    data.used = FormatHelper.convDataFormat(data.used, DATA_UNIT.KB);
    if ( childList.length > 0 ) {
      childList.map(function (child) {
        child['auditDtm'] = DateHelper.getShortDateNoDot(child['auditDtm']);
      });
      data['korLengStr'] = (childList.length < 6) ? USER_CNT[childList.length - 1] : childList.length;
    }

    return result;
  }

  private getData(usageData: any, svcInfo: any): any {
    return {
      svcInfo,
      usageData
    };
  }
}

export default MytUsageBandDataSharingsController;
