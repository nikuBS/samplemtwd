/**
 * FileName: myt-data.usage.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.13
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTUsageGraphbox from './myt-data.usage.graphbox.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_DATA_USAGE } from '../../../../types/string.type';

const VIEW = {
  DEFAULT: 'usage/myt-data.usage.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

const T_O_PLAN_BASE_DATA = [
  {
    'skipId': 'DD3EA',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD3EA
  },
  {
    'skipId': 'DD3DZ',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD3DZ
  },
  {
    'skipId': 'DD3DO',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD3DO
  },
  {
    'skipId': 'DD3DG',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD3DG
  },
  {
    'skipId': 'DD3D8',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD3D8
  },
  {
    'skipId': 'DD4D1',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_BASE_DATA.DD4D1
  }
];

const T_O_PLAN_SHARE_DATA = [
  {
    'skipId': 'DD3CX',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_SHARE_DATA.DD3CX
  },
  {
    'skipId': 'DD3CV',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_SHARE_DATA.DD3CV
  },
  {
    'skipId': 'DD3CU',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_SHARE_DATA.DD3CU
  },
  {
    'skipId': 'DD4D5',
    'prodNm': MYT_DATA_USAGE.T_O_PLAN_SHARE_DATA.DD4D5
  }
];

class MyTDataUsage extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // console.log('~~~~~~~~~~`svcInfo', svcInfo);
    // svcInfo.svcAttrCd = 'M2';

    const reqArr = new Array();
    reqArr.push(this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {}));
    switch ( svcInfo.svcAttrCd ) {
      case 'M1' :
        reqArr.push(this.apiService.request(API_CMD.BFF_05_0002, {})); // 부가 서비스
        break;
      case 'M2' :
        reqArr.push(this.apiService.request(API_CMD.BFF_05_0013, {})); // PPS 정보
        break;
    }

    Observable.combineLatest(reqArr).subscribe(([usageDataResp, extraDataResp]) => {
      if ( usageDataResp.code === API_CODE.CODE_00 ) {
        const fomattedData = this.parseUsageData(usageDataResp.result, svcInfo);
        const option = { usageData: fomattedData, svcInfo, pageInfo };

        if ( extraDataResp.code === API_CODE.CODE_00 ) {
          switch ( svcInfo.svcAttrCd ) {
            case 'M1' :
              option['balanceAddOns'] = extraDataResp.result;
              break;
            case 'M2' :
              // extraDataResp = {
              //   'code': '00',
              //   'msg': 'success',
              //   'result': {
              //     'prodAmt': '0',
              //     'remained': '500',
              //     'obEndDt': '20180615',
              //     'inbEndDt': '20180625',
              //     'numEndDt': '20200215',
              //     'dataYn': 'Y',
              //     'dataOnlyYn': 'N'
              //   }
              // };
                const extraData = extraDataResp.result;
                extraData.showObEndDt = DateHelper.getShortDateNoDot(extraData.obEndDt);
                extraData.showInbEndDt = DateHelper.getShortDateNoDot(extraData.inbEndDt);
                extraData.showNumEndDt = DateHelper.getShortDateNoDot(extraData.numEndDt);
                option['ppsInfo'] = extraData;
              break;
          }
        }
        res.render(VIEW.DEFAULT, option);
      } else {
        res.render(VIEW.ERROR, { usageData: usageDataResp, svcInfo: svcInfo });
      }
    });
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
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~usageData', usageData);
    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    // console.log('~~~~~~~~~~~~~~~~~~~~~~~~usageData', usageData);
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
          if (tOPlanBaseData.skipId === _data.skipId) {
            _data.prodNm = tOPlanBaseData.prodNm;
            return true;
          }
          return false;
        });
      }
    });
    return data;
  }
}

export default MyTDataUsage;
