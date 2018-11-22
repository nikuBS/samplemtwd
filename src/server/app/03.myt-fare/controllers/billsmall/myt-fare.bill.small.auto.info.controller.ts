/**
 * FileName: myt-fare.bill.small.auto.info.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.08
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';
import {MYT_FARE_PREPAY_NAME} from '../../../../types/bff.type';

class MyTFareBillSmallAutoInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getAutoCardInfo(),
      this.getAutoPrepayHistory()
    ).subscribe(([ autoCardInfo, autoPrepay ]) => {
      if (autoCardInfo.code === API_CODE.CODE_00 && autoPrepay.code === API_CODE.CODE_00) {
        res.render('billsmall/myt-fare.bill.small.auto.info.html', {
          autoCardInfo: this.parseCardInfo(autoCardInfo.result),
          autoPrepay: this.parsePrepayData(autoPrepay.result),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        const errorResponse = autoCardInfo.code === API_CODE.CODE_00 ? autoPrepay : autoCardInfo;
        this.error.render(res, {
          code: errorResponse.code,
          msg: errorResponse.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getAutoCardInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0072, {});
  }

  private getAutoPrepayHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0075, { pageNo: 1, listSize: 20 });
  }

  private parseCardInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChargeAmount = FormatHelper.addComma(result.autoChrgAmt);
      result.autoChargeStandardAmount = FormatHelper.addComma(result.autoChrgStrdAmt);
    }
    return result;
  }

  private parsePrepayData(result: any): any {
    const record = result.microPrepayReqRecord;
    if (!FormatHelper.isEmpty(record)) {
      record.map((data) => {
        data.name = MYT_FARE_PREPAY_NAME[data.autoChrgReqClCd];
        data.date = DateHelper.getFullDateAndTime(data.operDtm);
        data.autoChrgStrdAmount = FormatHelper.addComma(parseInt(data.autoChrgStrdAmt, 10).toString());
        data.autoChrgAmount = FormatHelper.addComma(parseInt(data.autoChrgAmt, 10).toString());
      });
    }
    record.code = API_CODE.CODE_00;
    record.totalCnt = result.totalCnt;
    return record;
  }
}

export default MyTFareBillSmallAutoInfo;
