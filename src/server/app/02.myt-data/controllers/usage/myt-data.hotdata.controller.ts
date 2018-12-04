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
import { SKIP_NAME, MYT_DATA_USAGE } from '../../../../types/string.type';
import { UNIT } from '../../../../types/bff.type';

const VIEW = {
  HOTDATA: 'usage/myt-data.hotdata.html',
  USAGE: 'usage/myt-data.usage.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

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

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // console.log('~~~~~~~~~~`svcInfo', svcInfo);
    // svcInfo.svcAttrCd = 'M2';

    const reqArr = new Array();
    reqArr.push(this.reqBalances());
    switch ( svcInfo.svcAttrCd ) {
      case 'M1' :
        reqArr.push(this.reqBalanceAddOns()); // 부가 서비스
        break;
      case 'M2' :
        reqArr.push(this.reqPpsCard()); // PPS 정보
        break;
    }

    Observable.combineLatest(reqArr).subscribe(([usageDataResp, extraDataResp]) => {
      if ( usageDataResp.code === API_CODE.CODE_00 ) {
        // const fomattedData = this.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
        let view = VIEW.USAGE;
        const option = { svcInfo, pageInfo };

        if ( extraDataResp.code === API_CODE.CODE_00 ) {
          switch ( svcInfo.svcAttrCd ) {
            case 'M1' :
                option['usageData'] = this.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
                option['balanceAddOns'] = extraDataResp.result;
                view = VIEW.HOTDATA;
              // console.log('~~~~~~~M1');
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
                extraData.showObEndDt = DateHelper.getShortDate(extraData.obEndDt);
                extraData.showInbEndDt = DateHelper.getShortDate(extraData.inbEndDt);
                extraData.showNumEndDt = DateHelper.getShortDate(extraData.numEndDt);
                option['usageData'] = this.parseUsageData(usageDataResp.result);
                option['ppsInfo'] = extraData;
              break;
            default:
              option['usageData'] = this.parseUsageData(usageDataResp.result);
              break;
          }
        }
        res.render(view, option);
      } else {
        res.render(VIEW.ERROR, { usageData: usageDataResp, svcInfo: svcInfo });
      }
    });
  }

  public parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    usageData.data = usageData.gnrlData || [];

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

  public parseCellPhoneUsageData(usageData: any, svcInfo: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    const gnrlData = usageData.gnrlData || [];  // 범용 데이터 공제항목
    const spclData = usageData.spclData || [];  // 특수 데이터 공제항목
    let dataArr = new Array();
    let defaultData;                            // 기본제공데이터
    let tPlanSharedData;                        // 통합공유데이터

    if (gnrlData) {
      // 총데이터 잔여량 표시
      let totalRemainUnLimited = false;
      gnrlData.map((_data) => {
        if (MYT_DATA_USAGE.UNLIMIT_CODE.indexOf(_data.unlimit) !== -1) {
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
        usageData.totalRemained = FormatHelper.convDataFormat(totalRemained, UNIT['140']);
      }

      // 기본제공데이터
      defaultData = gnrlData.find((_data) => {
        return _data.prodId === svcInfo.prodId;
      }) || {};

      // 기본제공데이터를 제외한 데이터 배열 취합
      dataArr = dataArr.concat(gnrlData.filter((_data) => {
        return _data.skipId !== defaultData.skipId;
      }));

      // 기본제공데이터가 있는 경우 최상위 노출
      if (!FormatHelper.isEmpty(defaultData.skipId)) {
        dataArr.unshift(defaultData);
      }
    }

    if (spclData) {
      // 통합공유데이터
      tPlanSharedData = this.getDataInTarget(T_O_PLAN_SHARE_DATA, spclData) || {};

      // 통합공유데이터 제외한 데이터 배열 취합
      dataArr = dataArr.concat(spclData.filter((_data) => {
        return _data.skipId !== tPlanSharedData.skipId;
      }));

      // 통합공유데이터가 있는 경우 기본제공 데이터의 sharedData에 할당
      if (!FormatHelper.isEmpty(tPlanSharedData.skipId) && defaultData) {
        defaultData.sharedData = tPlanSharedData;
      }
    }
    usageData.data = dataArr;
    // console.log('~~~~~~~~~~~~~usageData.data', usageData.data);

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

  private reqBalances(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {});
    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': '00',
    //       'msg': 'success',
    //       'result': {
    //         'dataTopUp': 'N',
    //         'ting': 'N',
    //         'dataDiscount': 'N',
    //
    //         'gnrlData': [
    //           {
    //             'prodId': 'POT10',
    //             'prodNm': 'T가족모아데이터',
    //             'skipId': 'POT10',
    //             'skipNm': 'T가족모아데이터',
    //             'unlimit': '0',
    //             'total': '9437184',
    //             'used': '0',
    //             'remained': '1048576',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005134',
    //             'prodNm': 'band 데이터 퍼펙트S',
    //             'skipId': 'testSkipId',
    //             'skipNm': 'band 데이터 퍼펙트S',
    //             'unlimit': '0',
    //             'total': '9437184',
    //             'used': '0',
    //             'remained': '2097152',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //           // ,
    //           // {
    //           //   'prodId': 'NA00005959',
    //           //   'prodNm': 'Data 인피니티',
    //           //   'skipId': 'DD3EA',
    //           //   'skipNm': '데이터통화 무제한',
    //           //   'unlimit': '1',
    //           //   'total': '무제한',
    //           //   'used': '무제한',
    //           //   'remained': '무제한',
    //           //   'unit': '140',
    //           //   'rgstDtm': '',
    //           //   'exprDtm': ''
    //           // }
    //         ],
    //         'spclData': [
    //           {
    //             'prodId': 'NA00005959',
    //             'prodNm': 'Data 인피니티',
    //             'skipId': 'DD3CX',
    //             'skipNm': '통합공유 데이터 40GB',
    //             'unlimit': '0',
    //             'total': '41943040',
    //             'used': '0',
    //             'remained': '41943040',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           // {
    //           //   'prodId': 'NA00005959',
    //           //   'prodNm': '다른놈',
    //           //   'skipId': '1234',
    //           //   'skipNm': '통합공유데이터 아님',
    //           //   'unlimit': '0',
    //           //   'total': '41943040',
    //           //   'used': '0',
    //           //   'remained': '41943040',
    //           //   'unit': '140',
    //           //   'rgstDtm': '',
    //           //   'exprDtm': ''
    //           // }
    //         ],
    //         'voice': [
    //           {
    //             'prodId': 'NA00005959',
    //             'prodNm': 'Data 인피니티',
    //             'skipId': 'DD3EB',
    //             'skipNm': '영상, 부가전화 300분',
    //             'unlimit': '0',
    //             'total': '18000',
    //             'used': '0',
    //             'remained': '18000',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'sms': [
    //           {
    //             'prodId': 'NA00005959',
    //             'prodNm': 'Data 인피니티',
    //             'skipId': 'DD3E4',
    //             'skipNm': 'SMS/MMS/ⓜ메신저 기본제공',
    //             'unlimit': 'B',
    //             'total': '기본제공',
    //             'used': '기본제공',
    //             'remained': '기본제공',
    //             'unit': '310',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'etc': [
    //           {
    //             'prodId': 'NA00000318',
    //             'prodNm': '착신전환(Voice only)',
    //             'skipId': 'DDC63',
    //             'skipNm': '착신전환 무료 제공',
    //             'unlimit': '0',
    //             'total': '16200',
    //             'used': '0',
    //             'remained': '16200',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ]
    //       }
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(resp);
    //       observer.complete();
    //     } else {
    //       observer.error();
    //     }
    //   }, 500);
    // });
  }

  private reqBalanceAddOns(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0002, {});
  }

  private reqPpsCard(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0013, {});
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

export default MyTDataHotdata;
