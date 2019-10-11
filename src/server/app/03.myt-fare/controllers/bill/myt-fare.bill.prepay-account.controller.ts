/**
 * @file myt-fare.bill.prepay-account.controller.ts
 * @author 양정규
 * @since 2019.09.27
 * @desc 나의 요금 > 소액결제/콘텐츠 이용료 > 선결제 > 실시간 계좌이체 page
 */

import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
import {MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @class
 * @desc 계좌이체 요금납부
 */
export default class MyTFareBillPrepayAccount extends TwViewController {

  constructor() {
    super();
  }

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
    const data = {
      svcInfo, // 회선정보 (필수 데이터)
      pageInfo, // 페이지정보 (필수 데이터)
      path: req.params.page
    };

    //  pathvariable(page) 이 small,ccontents 가 아니면 에러 페이지
    if (['small', 'contents'].indexOf(req.params.page) === -1) {
      return res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }

    if (!BrowserHelper.isApp(req)) { // 앱 환경 여부 체크
      res.render('share/common.share.app-install.info.html', {
        svcInfo, pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      }); // 앱이 아닐 경우 앱 설치 유도 페이지로 이동
    }

    Observable.combineLatest(
      this.getAutoInfo() // 자동납부 정보 조회
    ).subscribe(([autoInfo]) => {
      res.render('bill/myt-fare.bill.prepay-account.html', {
        ...data,
        autoInfo: this.parseInfo(autoInfo)
      });

    });
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
    const result = autoInfo.result || {};
    result.isAuto = autoInfo.code === API_CODE.CODE_00 && result.autoPayEnable === 'Y'
      && result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK; // 자동납부 정보(계좌)가 있는 경우

    if (result.isAuto) {
      result.bankFullName = result.autoPayBank.bankCardCoNm; // 은행명 풀네임
      result.bankName = result.autoPayBank.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, ''); // 은행명에서 '은행' 이름 제거
      result.bankNum = result.autoPayBank.bankCardNum; // 계좌번호
      result.bankCode = result.autoPayBank.bankCardCoCd; // 은행식별코드
    }
    return result;
  }
}
