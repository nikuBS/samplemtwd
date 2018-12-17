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
import { SKIP_NAME } from '../../../../types/string.type';
import { DAY_BTN_STANDARD_SKIP_ID, T0_PLAN_SKIP_ID, UNIT, UNLIMIT_CODE } from '../../../../types/bff.type';

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
        let view = VIEW.BAR;
        const option = {
          svcInfo,
          pageInfo,
          ppsInfo: null
        };

        switch ( svcInfo.svcAttrCd ) {
          case 'M1' :
              option['usageData'] = this.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
              if ( extraDataResp && extraDataResp.code === API_CODE.CODE_00 ) {
                option['balanceAddOns'] = extraDataResp.result;
              }
              view = VIEW.CIRCLE;
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
              option['usageData'] = this.parseUsageData(usageDataResp.result);
              if ( extraDataResp && extraDataResp.code === API_CODE.CODE_00 ) {
                const extraData = extraDataResp.result;
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
      } else {
        res.render(VIEW.ERROR, { usageData: usageDataResp, svcInfo: svcInfo });
      }
    });
  }

  public parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms', 'etc'];
    this.setTotalRemained(usageData);
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
          return !(_data.skipId === 'PA' && _data.prodId === pa.prodId);
        });
      });
    }

    // skipId가 'PA' && 무제한이 아닌 경우 노출 제외
    dataArr = dataArr.filter((_data) => {
      return !(_data.skipId === 'PA' && (UNLIMIT_CODE.indexOf(_data.unlimit) === -1));
    });


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
      usageData.totalRemained = FormatHelper.convDataFormat(totalRemained, UNIT['140']);
    }
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
    //         'gnrlData': [
    //           {
    //             'prodId': 'POT10',
    //             'prodNm': 'T가족모아데이터',
    //             'skipId': 'POT10',
    //             'skipNm': 'T가족모아데이터',
    //             'unlimit': '0',
    //             'total': '0',
    //             'used': '0',
    //             'remained': '0',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'FD004',
    //             'skipNm': '데이터리필',
    //             'unlimit': '0',
    //             'total': '20971520',
    //             'used': '0',
    //             'remained': '20971520',
    //             'unit': '140',
    //             'rgstDtm': '20181201000000',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'FD004',
    //             'skipNm': '데이터리필',
    //             'unlimit': '0',
    //             'total': '20971520',
    //             'used': '0',
    //             'remained': '20971520',
    //             'unit': '140',
    //             'rgstDtm': '20181212101442',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3DZ',
    //             'skipNm': '데이터통화 150GB 무료',
    //             'unlimit': '0',
    //             'total': '157286400',
    //             'used': '0',
    //             'remained': '157286400',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'spclData': [
    //           {
    //             'prodId': 'NH00000100',
    //             'prodNm': '온가족프리_혜택1_500MB',
    //             'skipId': 'DDR38',
    //             'skipNm': '온가족프리 데이터500MB',
    //             'unlimit': '0',
    //             'total': '512000',
    //             'used': '0',
    //             'remained': '512000',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3CV',
    //             'skipNm': '통합공유 데이터 20GB',
    //             'unlimit': '0',
    //             'total': '20971520',
    //             'used': '0',
    //             'remained': '20971520',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3D0',
    //             'skipNm': '한도초과후 데이터 무료',
    //             'unlimit': '1',
    //             'total': '무제한',
    //             'used': '무제한',
    //             'remained': '무제한',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00004217',
    //             'prodNm': 'oksusu 데이터 프리',
    //             'skipId': 'DDZ25',
    //             'skipNm': 'oksusu 데이터프리 데이터무제한',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '0',
    //             'remained': '무제한',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00004217',
    //             'prodNm': 'oksusu 데이터 프리',
    //             'skipId': 'PA',
    //             'skipNm': '일별 사용량',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '4096',
    //             'remained': '무제한',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00004720',
    //             'prodNm': 'band 타임 프리',
    //             'skipId': 'DD0PB',
    //             'skipNm': 'band 타임 프리 데이터무제한',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '0',
    //             'remained': '무제한',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00004720',
    //             'prodNm': 'band 타임 프리',
    //             'skipId': 'PA',
    //             'skipNm': '일별 사용량',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '4096',
    //             'remained': '무제한',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA000042171',
    //             'prodNm': 'oksusu 데이터 프리 무제한 아님!!!!!!',
    //             'skipId': 'PA',
    //             'skipNm': '일별 사용량',
    //             'unlimit': '0',
    //             'total': '4096',
    //             'used': '0',
    //             'remained': '4096',
    //             'unit': '140',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'voice': [
    //           {
    //             'prodId': 'NH00000087',
    //             'prodNm': '온가족프리_혜택2_가족무료',
    //             'skipId': 'DDM57',
    //             'skipNm': '온가족 가족간 음성통화 무료',
    //             'unlimit': '0',
    //             'total': '300000',
    //             'used': '0',
    //             'remained': '300000',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3E0',
    //             'skipNm': '영상, 부가전화 300분',
    //             'unlimit': '0',
    //             'total': '18000',
    //             'used': '0',
    //             'remained': '18000',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3DX',
    //             'skipNm': 'SKT 고객간 음성 무제한',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '0',
    //             'remained': '무제한',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3DY',
    //             'skipNm': '집전화·이동전화 음성 무제한',
    //             'unlimit': 'M',
    //             'total': '무제한',
    //             'used': '0',
    //             'remained': '무제한',
    //             'unit': '240',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'sms': [
    //           {
    //             'prodId': 'NA00005958',
    //             'prodNm': '패밀리',
    //             'skipId': 'DD3DT',
    //             'skipNm': 'SMS/MMS/ⓜ메신저 기본제공',
    //             'unlimit': 'B',
    //             'total': '기본제공',
    //             'used': '기본제공',
    //             'remained': '기본제공',
    //             'unit': '310',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           },
    //           {
    //             'prodId': 'NH00000087',
    //             'prodNm': '온가족프리_혜택2_가족무료',
    //             'skipId': 'DDM58',
    //             'skipNm': '온가족 가족간 SMS 무료',
    //             'unlimit': 'B',
    //             'total': '기본제공',
    //             'used': '기본제공',
    //             'remained': '기본제공',
    //             'unit': '310',
    //             'rgstDtm': '',
    //             'exprDtm': ''
    //           }
    //         ],
    //         'etc': []
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
    dataArray.map((_data) => {
      if (target.indexOf(_data.skipId) !== -1) {
        data = _data;
      }
    });
    return data;
  }
}

export default MyTDataHotdata;
