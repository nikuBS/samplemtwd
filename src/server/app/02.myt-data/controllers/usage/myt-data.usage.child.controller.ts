/**
 * FileName: myt-data.usage.child.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.09.18
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTDataHotData from './myt-data.hotdata.controller';
import FormatHelper from '../../../../utils/format.helper';
import {  MYT_DATA_CHILD_USAGE } from '../../../../types/string.type';

const VIEW = {
  DEFAULT: 'usage/myt-data.usage.child.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataUsageChild extends TwViewController {
  private childSvcMgmtNum;
  private myTDataHotData = new MyTDataHotData();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const self = this;
    this.childSvcMgmtNum = req.query.childSvcMgmtNum;
    if (FormatHelper.isEmpty(this.childSvcMgmtNum)) {
      return this.renderErr(res, svcInfo, {});
    }
    Observable.combineLatest(
      this.reqBalances(),
      this.reqBaseFeePlan(),
      this.reqTingSubscriptions()
    ).subscribe(([usageDataResp, baseFeePlanResp, tingSubscriptionsResp]) => {
      const apiError = this.error.apiError([
        usageDataResp, baseFeePlanResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, svcInfo, apiError);
      }

      const usageDataResult = usageDataResp.result;
      const baseFeePlan = baseFeePlanResp.result;
      const usageData = self.myTDataHotData.parseUsageData(usageDataResult);
      const tingSubscription = tingSubscriptionsResp.code === API_CODE.CODE_00;
      const child = childInfo.find((_child) => {
        return _child.svcMgmtNum === this.childSvcMgmtNum;
      });
      usageData['childSvcNum'] = child.svcNum;
      usageData['childSvcMgmtNum'] = child.svcMgmtNum;
      usageData['childProdId'] = baseFeePlan.prodId;
      usageData['childProdNm'] = baseFeePlan.prodName;
      const option = {
        usageData,
        tingSubscription,
        svcInfo,
        pageInfo
      };
      res.render(VIEW.DEFAULT, option);
    }, (resp) => {
      return this.renderErr(res, svcInfo, resp);
    });
  }

  private renderErr(res, svcInfo, err): any {
    const option = {
      title: MYT_DATA_CHILD_USAGE.TITLE,
      svcInfo
    };
    if (err) {
      Object.assign(option, err);
    }
    return this.error.render(res, option);
  }

  private reqBalances(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {
      childSvcMgmtNum: this.childSvcMgmtNum
    });
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

  private reqTingSubscriptions(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0028, {
      childSvcMgmtNum: this.childSvcMgmtNum
    });
  }

  private reqBaseFeePlan(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0041, {
      childSvcMgmtNum: this.childSvcMgmtNum
    });
  }
}

export default MyTDataUsageChild;
