/**
 * FileName: myt-data.hotdata.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTUsageGraphbox from './myt-data.usage.graphbox.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_DATA_USAGE, SKIP_NAME } from '../../../../types/string.type';
import {
  DAY_BTN_STANDARD_SKIP_ID,
  SVC_ATTR_E,
  T0_PLAN_SKIP_ID,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../../types/bff.type';

const VIEW = {
  CIRCLE: 'usage/myt-data.hotdata.html',
  BAR: 'usage/myt-data.usage.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.reqBalances()).subscribe(([usageDataResp]) => {
      if ( usageDataResp.code === API_CODE.CODE_00 ) {
        let extraDataReq;
        switch ( svcInfo.svcAttrCd ) {
          case SVC_ATTR_E.MOBILE_PHONE :
            extraDataReq = this.reqBalanceAddOns(); // 부가 서비스
            break;
          case SVC_ATTR_E.PPS :
            extraDataReq = this.reqPpsCard(); // PPS 정보
            break;
        }
        Observable.combineLatest(extraDataReq).subscribe(([extraDataResp]) => {
          let view = VIEW.BAR;
          const option = {
            svcInfo,
            pageInfo,
            usageData: {},
            balanceAddOns: {},
            ppsInfo: {}
          };

          switch ( svcInfo.svcAttrCd ) {
            case SVC_ATTR_E.MOBILE_PHONE :
              option['usageData'] = this.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
              if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
                option['balanceAddOns'] = extraDataResp['result'];
              }
              view = VIEW.CIRCLE;
              break;
            case SVC_ATTR_E.PPS :
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
              option['usageData'] = this.parseUsageData(usageDataResp.result);
              if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
                const extraData = extraDataResp['result'];
                extraData.showObEndDt = DateHelper.getShortDate(extraData.obEndDt);
                extraData.showInbEndDt = DateHelper.getShortDate(extraData.inbEndDt);
                extraData.showNumEndDt = DateHelper.getShortDate(extraData.numEndDt);
                option['ppsInfo'] = extraData;
              }
              break;
            default:
              option['usageData'] = this.parseUsageData(usageDataResp.result);
              break;
          }
          res.render(view, option);
        });
      } else {
        res.render(VIEW.ERROR, { usageData: usageDataResp, svcInfo: svcInfo });
      }
    }, (resp) => {
      res.render(VIEW.ERROR, { usageData: resp, svcInfo: svcInfo });
    });
  }

  public parseUsageData(usageData: any): any {
    const kinds = [
      MYT_DATA_USAGE.DATA_TYPE.DATA,
      MYT_DATA_USAGE.DATA_TYPE.VOICE,
      MYT_DATA_USAGE.DATA_TYPE.SMS,
      MYT_DATA_USAGE.DATA_TYPE.ETC
    ];
    this.setTotalRemained(usageData);
    usageData.data = usageData.gnrlData || [];

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    return usageData;
  }

  public parseCellPhoneUsageData(usageData: any, svcInfo: any): any {
    const kinds = [
      MYT_DATA_USAGE.DATA_TYPE.DATA,
      MYT_DATA_USAGE.DATA_TYPE.VOICE,
      MYT_DATA_USAGE.DATA_TYPE.SMS,
      MYT_DATA_USAGE.DATA_TYPE.ETC
    ];
    const gnrlData = usageData.gnrlData || [];  // 범용 데이터 공제항목
    const spclData = usageData.spclData || [];  // 특수 데이터 공제항목
    let dataArr = new Array();
    let defaultData;                            // 기본제공데이터
    let tOPlanSharedData;                        // 통합공유데이터

    // 임시
    // svcInfo.prodId = 'NA00005955';              // lck6464

    if (gnrlData) {
      // 총데이터 잔여량 표시
      this.setTotalRemained(usageData);

      // 기본제공데이터
      defaultData = gnrlData.find((_data) => {
        return _data.prodId === svcInfo.prodId && FormatHelper.isEmpty(_data.rgstDtm);
      }) || {};

      // 기본제공데이터를 제외한 데이터 배열 취합
      dataArr = dataArr.concat(gnrlData.filter((_data) => {
        return _data.skipId !== defaultData.skipId;
      }));

      // 기본제공데이터가 있는 경우 최상위 노출
      if (!FormatHelper.isEmpty(defaultData.skipId)) {
        dataArr.unshift(defaultData);
        usageData.hasDefaultData = true;
      } else {
        usageData.hasDefaultData = false;
      }
    }

    if (spclData) {
      // 통합공유데이터
      tOPlanSharedData = this.getDataInTarget(T0_PLAN_SKIP_ID, spclData) || {};

      // 통합공유데이터 제외한 데이터 배열 취합
      dataArr = dataArr.concat(spclData.filter((_data) => {
        return _data.skipId !== tOPlanSharedData.skipId;
      }));

      // 기본제공 데이터 존재
      if (usageData.hasDefaultData) {
        // T/O플랜인 경우 기본제공 데이터의 tOPlanSharedData에 할당
        if (!FormatHelper.isEmpty(tOPlanSharedData.skipId)) {
          defaultData.tOPlanSharedData = tOPlanSharedData;
        } else {
          defaultData.sharedData = true;
        }
      }
    }

    // 당일 사용량(PA) DDZ25, DDZ23, DD0PB 에 해당하는 공제항목이 있으면
    // 해당 항목의 prodId와 같고 && skipId가 'PA'인 항목은 노출 제외

    const pas = dataArr.filter((_data) => {
      return DAY_BTN_STANDARD_SKIP_ID.indexOf(_data.skipId) !== -1;
    });

    if (pas.length > 0) {
      pas.map((pa) => {
        dataArr = dataArr.filter((_data) => {
          return !(_data.skipId === SKIP_NAME.DAILY && _data.prodId === pa.prodId);
        });
      });
    }

    // skipId가 'PA' && 무제한이 아닌 경우 노출 제외
    dataArr = dataArr.filter((_data) => {
      return !(_data.skipId === SKIP_NAME.DAILY && (UNLIMIT_CODE.indexOf(_data.unlimit) === -1));
    });


    usageData.data = dataArr;

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    return usageData;
  }

  private setTotalRemained(usageData: any) {
    const gnrlData = usageData.gnrlData || [];
    let totalRemainUnLimited = false;
    gnrlData.map((_data) => {
      if (UNLIMIT_CODE.indexOf(_data.unlimit) !== -1) {
        totalRemainUnLimited = true;
      }
    });
    if (totalRemainUnLimited) {
      usageData.totalRemainUnLimited = true;
      usageData.totalRemained = SKIP_NAME.UNLIMIT;
    } else {
      const totalRemained = gnrlData.reduce((_memo, _data) => {
        return _memo + parseInt(_data.remained, 10);
      }, 0);
      usageData.totalRemained = FormatHelper.convDataFormat(totalRemained, UNIT[UNIT_E.DATA]);
    }
  }

  private reqBalances(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {});
  }

  private reqBalanceAddOns(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0002, {});
  }

  private reqPpsCard(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0013, {});
  }

  private getDataInTarget(target: any, dataArray: any): any {
    let data;
    dataArray.map((_data) => {
      if (target.indexOf(_data.skipId) !== -1) {
        data = _data;
      }
    });
    return data;
  }
}

export default MyTDataHotdata;
