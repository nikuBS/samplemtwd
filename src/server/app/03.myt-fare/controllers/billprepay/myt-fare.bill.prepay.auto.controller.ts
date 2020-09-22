/**
 * @file myt-fare.bill.prepay.auto.controller.ts
 * @author 양정규
 * @since 2020.09.03
 * @desc 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';
import {MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';
import {MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';

/**
 * @class
 * @desc 소액결제/콘텐츠이용료 자동 선결제 신청 및 변경
 */
export class MyTFareBillPrepayAuto extends TwViewController {
  constructor() {
    super();
  }

  private path;
  private change;

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
    if (true || BrowserHelper.isApp(req)) { // 앱인 경우에만 진입 가능
      this.path = req.path.indexOf('small') > -1 ? 'small' : 'contents';  // 경로 (small:소액결제, contents:콘텐츠 이용료)
      // change: 변경, !change: 신청
      this.change = req.path.indexOf('change') > -1 ? 'change' : '';
      Observable.combineLatest(
        this.getAutoPrepayInfo(),
        this.getAutoInfo()
      ).subscribe((responses) => {
        const apiError = this.error.apiError(responses);
        if ( !FormatHelper.isEmpty(apiError) ) {
          this.fail(res, apiError, svcInfo, pageInfo);
          return;
        }

        res.render('billprepay/myt-fare.bill.prepay.auto.html', Object.assign({
          path: this.path,
          svcInfo,
          pageInfo
        }, this.parseData(req, responses)));
      });
    } else { // 모바일웹인 경우 앱 설치 유도 페이지로 이동
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }



  /**
   * @function
   * @desc 페이지에 보낼 데이터 생성
   * @param req
   * @param res
   * @private
   */
  private parseData(req: Request, res: any): any {
    return {
      autoPrepayInfo: this.parseAutoPrepayInfo(res[0].result),
      autoInfo: this.parseInfo(res[1]),
      change: this.change
    };
  }

  /**
   * @function
   * @desc 소액결제/콘텐츠 이용료 자동선결제 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoPrepayInfo(): Observable<any> {
    const BFF_ID = this.path === 'small' ? API_CMD.BFF_07_0086 : API_CMD.BFF_07_0085;
    return this.apiService.request(BFF_ID, {});
  }

  /**
   * @function
   * @desc parsing data
   * @param result
   * @returns {any}
   */
  private parseAutoPrepayInfo(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      let  autoChrgStrdAmt = 'cmbAutoChrgStrdAmt', autoChrgAmt = 'cmbAutoChrgAmt';
      if (this.change) {
        // OP002-1757 필드명 변경(cmb 프리픽스 제거). cmbAutoChrgStrdAmt, cmbAutoChrgAmt -> autoChrgStrdAmt, autoChrgAmt
        autoChrgStrdAmt = 'autoChrgStrdAmt', autoChrgAmt = 'autoChrgAmt';
      }

      result.comboStandardAmount = result[autoChrgStrdAmt] / 10000; // 기준금액 만원단위로 표시
      result.comboChargeAmount = result[autoChrgAmt] / 10000; // 선결제금액 만원단위로 표시
      result.comboMaxAmount = result.cmbMaxAmt / 10000; // 최대금액 만원단위로 표시
      result.standardAmount = result[autoChrgStrdAmt];
      result.chargeAmount = result[autoChrgAmt];

      result.cardNum = '';
      result.bankNm = '';
      result.bankNum = '';
      // 자동 선결제 변경 일때
      const {settlWayCd} = result;
      if (this.change && settlWayCd) {
        // 카드일때
        if (settlWayCd === '02') {
          result.cardNum = result.autoBankCardNumH;
        } else if (settlWayCd === '41') { // 계좌이체
          result.bankNm = result.autoBankCardNm;
          result.bankNum = result.autoBankCardNumH;
        }
      }
    }
    return result;
  }

  /**
   * @function
   * @desc 자동납부 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoInfo(): Observable<any> {
    // todo JK : 어드민에 BFF_07_0022 추가하기
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
      result.isAuto = result.autoPayEnable === 'Y' && result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK; // 자동납부 정보(계좌)가 있는 경우

      if (result.isAuto) {
        result.bankFullName = result.autoPayBank.bankCardCoNm; // 은행명 풀네임
        result.bankName = result.autoPayBank.bankCardCoNm.replace(MYT_FARE_PAYMENT_NAME.BANK, ''); // 은행명에서 '은행' 이름 제거
        result.bankNum = result.autoPayBank.bankCardNum; // 계좌번호
        result.bankCode = result.autoPayBank.bankCardCoCd; // 은행식별코드
      }
      return result;
    }
    return null;
  }

  /**
   * API Response fail
   * @param res
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  private fail(res: Response, data: any, svcInfo: any, pageInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}
