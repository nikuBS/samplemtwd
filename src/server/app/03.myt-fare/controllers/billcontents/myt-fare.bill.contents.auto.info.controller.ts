/**
 * @file myt-fare.bill.contents.auto.info.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.08
 * Description: 콘텐츠이용료 자동선결제 신청/변경/해지 내역 관리
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';
import {MYT_FARE_PREPAY_NAME} from '../../../../types/bff.type';

class MyTFareBillContentsAutoInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getAutoCardInfo(), // 현재 신청된 카드정보 조회
      this.getAutoPrepayHistory() // 신청 및 변경내역 조회
    ).subscribe(([ autoCardInfo, autoPrepay ]) => {
      if (autoCardInfo.code === API_CODE.CODE_00 && autoPrepay.code === API_CODE.CODE_00) {
        res.render('billcontents/myt-fare.bill.contents.auto.info.html', {
          autoCardInfo: this.parseCardInfo(autoCardInfo.result),
          autoPrepay: this.parsePrepayData(autoPrepay.result),
          svcInfo: svcInfo, // 회선 정보 (필수)
          pageInfo: pageInfo // 페이지 정보 (필수)
        });
      } else {
        const errorResponse = autoCardInfo.code === API_CODE.CODE_00 ? autoPrepay : autoCardInfo;
        this.error.render(res, {
          code: errorResponse.code,
          msg: errorResponse.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getAutoCardInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0080, {});
  }

  private getAutoPrepayHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0079, { pageNo: 1, listSize: 20 });
  }

  private parseCardInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChargeAmount = FormatHelper.addComma(result.autoChrgAmt); // 선결제 신청금액에 콤마(,) 추가
      result.autoChargeStandardAmount = FormatHelper.addComma(result.autoChrgStrdAmt); // 기준금액에 콤마(,) 추가
    }
    return result;
  }

  private parsePrepayData(result: any): any {
    const record = result.useContentsAutoPrepayRecord;
    if (!FormatHelper.isEmpty(record)) {
      record.map((data) => {
        data.name = MYT_FARE_PREPAY_NAME[data.autoChrgReqClCd]; // 신청, 변경, 해지
        data.date = DateHelper.getFullDateAnd24Time(data.operDtm); // 신청일 YYYY.M.D. hh:mm:ss
        data.autoChrgStrdAmount = FormatHelper.addComma(parseInt(data.autoChrgStrdAmt, 10).toString()); // 기준금액에 콤마(,) 추가
        data.autoChrgAmount = FormatHelper.addComma(parseInt(data.autoChrgAmt, 10).toString()); // 선결제 신청금액에 콤마(,) 추가
      });
    }
    record.code = API_CODE.CODE_00;
    record.totalCnt = result.totalCnt;
    return record;
  }
}

export default MyTFareBillContentsAutoInfo;
