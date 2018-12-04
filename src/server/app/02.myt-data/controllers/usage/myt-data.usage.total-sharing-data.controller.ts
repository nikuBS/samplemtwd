/**
 * FileName: myt-data.usage.total-sharing-data.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.08
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataHotData from './myt-data.hotdata.controller';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_TOTAL_SHARING_DATA } from '../../../../types/string.type';

class MyTDataUsageTotalSharingData extends TwViewController {
  private myTDataHotData = new MyTDataHotData();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqBalances(),
      this.reqBalanceAddOns(),
    ).subscribe(([balancesResp, balanceAddOnsResp]) => {
      // console.log('~~~~~~~resp', balancesResp, balanceAddOnsResp);
      const apiError = this.error.apiError([
        balancesResp, balanceAddOnsResp
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.renderErr(res, apiError, svcInfo);
      }

      const fomattedData = this.myTDataHotData.parseCellPhoneUsageData(balancesResp.result, svcInfo);
      const defaultData = this.getDefaultData(fomattedData.data)[0];
      this.convShowData(defaultData);

      if (!defaultData) {
        return this.renderErr(res, {}, svcInfo);
      }

      const option = {
        defaultData: defaultData || {},
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {}
      };

      option['balanceAddOns'] = balanceAddOnsResp.result;
      res.render('usage/myt-data.usage.total-sharing-data.html', option);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
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

  private getDefaultData(datas: any): any {
    return datas.filter((data) => {
      return data.sharedData;
    });
  }

  private convShowData(data: any) {
    data.isUnlimited = !isFinite(data.total);
  }

  private renderErr(res, err, svcInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_TOTAL_SHARING_DATA.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo
    });
  }
}

export default MyTDataUsageTotalSharingData;
