/**
 * FileName: myt-fare.bill.option.register.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.02
 * Description: 자동납부 신청 및 변경
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_FARE_PAYMENT_TITLE, MYT_FARE_PAYMENT_NAME, MYT_FARE_PAYMENT_TYPE} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';

class MyTFareBillOptionRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) { // 앱일 경우에만 진입 가능
      this.getPaymentOption().subscribe((paymentOption) => {
        if (paymentOption.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.option.register.html', {
            svcInfo: svcInfo, // 회선 정보 (필수)
            pageInfo: pageInfo, // 페이지 정보 (필수)
            paymentOption: this.parseData(paymentOption.result)
          });
        } else {
          this.error.render(res, {
            code: paymentOption.code,
            msg: paymentOption.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
    } else {
      /* 모바일웹이면 앱 설치 유도 페이지로 이동 */
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  /* 납부방법 조회 */
  private getPaymentOption(): any {
    return this.apiService.request(API_CMD.BFF_07_0060, {}).map((res) => {
      return res;
    });
  }

  /* 데이터 가공 */
  private parseData(result): any {
    result.payCode = '1'; // default setting
    result.payDate = '11'; // default setting

    /* 이미 자동납부 신청이 되어 있으면 */
    if (result.payMthdCd === MYT_FARE_PAYMENT_TYPE.BANK || result.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD) {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_CHANGE; // 변경하기
      result.buttonName = MYT_FARE_PAYMENT_NAME.CHANGE; // 변경하기
      result.type = 'change';
      result.isAuto = true;

      /* 카드납부 중이면 */
      if (result.payMthdCd === MYT_FARE_PAYMENT_TYPE.CARD && result.payCyclNm !== undefined) {
        result.payCode = result.payCyclCd;
        result.payDate = result.payCyclNm;
      }
    } else {
      result.title = MYT_FARE_PAYMENT_TITLE.AUTO_NEW; // 신청하기
      result.buttonName = MYT_FARE_PAYMENT_NAME.NEW; // 신청하기
      result.type = 'new';
      result.isAuto = false;
    }

    result.bankList = this.getBankList(result.lBankArray); // 납부 가능한 은행리스트
    return result;
  }

  /* 납부 가능한 은행 리스트 조회 */
  private getBankList(bankArray: any[]): any {
    const bankList: any = [];
    if (!FormatHelper.isEmpty(bankArray)) {
      for (let i = 0; i < bankArray.length; i++) {
        const obj = {
          bankCardCoCd: bankArray[i].commCdVal, // 은행코드
          bankCardCoNm: bankArray[i].commCdValNm // 은행명
        };
        bankList.push(obj);
      }
      return JSON.stringify(bankList);
    }
    return bankList;
  }
}

export default MyTFareBillOptionRegister;
