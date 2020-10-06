/**
 * @file myt-fare.bill.prepay.auto.info.controller.ts
 * @author 양정규
 * @since 2020.09.04
 * @desc 소액결제/콘텐츠 이용료 자동선결제 신청/변경/해지 내역 관리 page
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';
import {MYT_FARE_PREPAY_NAME} from '../../../../types/bff.type';

/**
 * @class
 * @desc 소액결제 자동선결제 신청/변경/해지 내역 관리
 */
export class MyTFareBillPrepayAutoInfo extends TwViewController {
  constructor() {
    super();
  }

  private path;
  private isSmall: boolean = true;

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.path = req.path.indexOf('small') > -1 ? 'small' : 'contents';  // 경로 (small:소액결제, contents:콘텐츠 이용료)
    this.isSmall = this.path === 'small';
    Observable.combineLatest(
      this.getAutoCardInfo(), // 현재 신청된 카드정보 조회
      this.getAutoPrepayHistory() // 신청 및 변경내역 조회
    ).subscribe(([ autoCardInfo, autoPrepay ]) => {
      if (autoCardInfo.code === API_CODE.CODE_00 && autoPrepay.code === API_CODE.CODE_00) {
        res.render('billprepay/myt-fare.bill.prepay.auto.info.html', {
          autoCardInfo: this.parseCardInfo(autoCardInfo.result),
          autoPrepay: this.parsePrepayData(autoPrepay.result),
          path: this.path,
          svcInfo, // 회선 정보 (필수)
          pageInfo // 페이지 정보 (필수)
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

  /**
   * @function
   * @desc 현재 신청된 카드정보 조회
   * @returns {Observable<any>}
   */
  private getAutoCardInfo(): Observable<any> {
    const BFF_ID = this.isSmall ? API_CMD.BFF_07_0072 : API_CMD.BFF_07_0080;
    return this.apiService.request(BFF_ID, {});
  }

  /**
   * @function
   * @desc 신청 및 변경내역 조회
   * @returns {Observable<any>}
   */
  private getAutoPrepayHistory(): Observable<any> {
    const BFF_ID = this.isSmall ? API_CMD.BFF_07_0075 : API_CMD.BFF_07_0079;
    return this.apiService.request(BFF_ID, { pageNo: 1, listSize: 20 });
  }

  /**
   * @function
   * @desc parsing card info
   * @param result
   * @returns {any}
   */
  private parseCardInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.autoChargeAmount = FormatHelper.addComma(result.autoChrgAmt); // 선결제 신청금액에 콤마(,) 추가
      result.autoChargeStandardAmount = FormatHelper.addComma(result.autoChrgStrdAmt); // 기준금액에 콤마(,) 추가
    }
    return result;
  }

  /**
   * @function
   * @desc parsing prepay data
   * @param result
   * @returns {any}
   */
  private parsePrepayData(result: any): any {
    const record = this.isSmall ? result.microPrepayReqRecord : result.useContentsAutoPrepayRecord;
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
