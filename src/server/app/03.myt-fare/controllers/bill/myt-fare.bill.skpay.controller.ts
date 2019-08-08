/**
 * @file myt-fare.bill.skpay.controller.ts
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 * @desc SK pay 요금납부 페이지
 */

import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
import BrowserHelper from '../../../../utils/browser.helper';
import MyTFareBillPaymentCommon from './myt-fare.bill.payment.common.controller';

/**
 * @class
 * @desc SK pay 요금납부
 */
class MyTFareBillSkpay extends MyTFareBillPaymentCommon {

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
    var https = 'https';
    if(req.headers.host === 'localhost:3000'){
      https = 'http';
    }
    const data = {
      title: MYT_FARE_PAYMENT_TITLE.SKPAY,
      svcInfo: svcInfo, // 회선정보 (필수 데이터)
      pageInfo: pageInfo, // 페이지정보 (필수 데이터)
      redirectUri : https + '://' + req.headers.host + '/myt-fare/bill/skpay/result'
    };

    if (BrowserHelper.isApp(req)) { // 앱 환경 여부 체크
      Observable.combineLatest(
        this.getUnpaidList(), // 미납요금 대상자 조회
        this.getAutoInfo() // 자동납부 정보 조회.
      ).subscribe(([unpaidList, autoInfo]) => {
        if (unpaidList.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.skpay.html', {
            ...data,
            unpaidList: this.parseData(unpaidList.result, svcInfo, allSvc, pageInfo),
            // autoInfo: this.parseInfo(autoInfo), // 자동납부 정보를 선택할 수 없게 수정.
            autoInfo: null,
            formatHelper: FormatHelper
          });
        } else {
          this.error.render(res, {
            code: unpaidList.code, msg: unpaidList.msg, pageInfo: pageInfo, svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      }); // 앱이 아닐 경우 앱 설치 유도 페이지로 이동
    }
  }

  /**
   * @function
   * @desc 자동납부 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0022, {});
  }

  /**
   * @function
   * @desc parsing data
   * @param autoInfo
   * @returns {any}
   */
  private parseInfo(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      const result = autoInfo.result;

      result.isAuto = result.autoPayEnable === 'Y' && result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK; // 자동납부 정보(계좌)가 있는 경우 (for 환불계좌정보)
      if (result.isAuto) {
        result.bankName = result.autoPayBank.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, ''); // 은행명에서 '은행' 이름 제거
        result.bankNum = result.autoPayBank.bankCardNum; // 계좌번호
        result.bankCode = result.autoPayBank.bankCardCoCd; // 은행식별코드
      }
      return result;
    }
    return null;
  }
}

export default MyTFareBillSkpay;
