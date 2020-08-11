/**
 * @file myt-fare.bill.skpay.result.controller.ts
 * @file SK pay 결과 처리
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 */

import { NextFunction, Request, Response } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_FARE_COMPLETE_MSG, MYT_FARE_ERROR_MSG } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Query {
  orderNumber: string;
}

interface ResultJsonError {
  code: string;
  message: string;
}

interface ResultJson {
  paymentTokenIdentifier: string;
  paymentToken: string;
}

class MyTFareBillSkpayResult extends TwViewController {
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
    const query: Query = {
      orderNumber: req.query.dataKey
    };
    const status = req.body.status;
    const result = req.body.result;
    let paymentToken = '';
    let resultUtf = '';
    let codeError = '';
    const historyDepth = -3;
    const renderUrl = 'bill/myt-fare.bill.skpay.result.html';

    resultUtf = this.getResultUtf(result, resultUtf);

    if (status === 200) {
      paymentToken = this.getPaymentToken(resultUtf, paymentToken);
      const data = this.getDataApi(query, paymentToken);
      this.apiService.request(API_CMD.BFF_07_0097, data).subscribe((createInfo) => {
        if (createInfo.code === API_CODE.CODE_00 && createInfo.result.successYn === 'Y') {
          return res.redirect('/myt-fare/bill/pay-complete');
        } else {
          return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, createInfo.code, createInfo.msg), {
            pageInfo,
            historyDepth
          }));
        }
      });
    } else {
      if (resultUtf) {
        const resultJsonError: ResultJsonError = JSON.parse(resultUtf);
        codeError = resultJsonError.code;
      }
      if (codeError === 'USER_EXIT') { // USER_EXIT 사용자 취소
        return res.redirect('/myt-fare/submain');
      } else if (codeError === 'BAD_REQUEST') { // BAD_REQUEST 잘못된 요청
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), {
          pageInfo,
          historyDepth
        }));
      } else if (codeError === 'EXCEPTION') { // EXCEPTION 11 Pay 내부 오류
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), {
          pageInfo,
          historyDepth
        }));
      } else { // 정의되지 않은 오류
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), {
          pageInfo,
          historyDepth
        }));
      }
    }
  }

  private getResultUtf(result: any, resultUtf: string) {
    if (result) {
      resultUtf = new Buffer(result, 'base64').toString('utf-8');
    }
    return resultUtf;
  }

  private getDataApi(query: Query, paymentToken: string) {
    return {
      orderNumber: query.orderNumber,
      paymentToken: paymentToken
    };
  }

  private getPaymentToken(resultUtf: string, paymentToken: string) {
    if (resultUtf) {
      const resultText2 = JSON.parse(resultUtf);
      if (resultText2) {
        const resultJson: ResultJson = JSON.parse(resultText2);
        paymentToken = resultJson.paymentToken;
      }
    }
    return paymentToken;
  }
  /**
   * @function
   * @desc get data
   * @param mainTitle
   * @param errorCode
   * @param errorMsg
   * @private
   */
  private _getDataError(mainTitle: any, errorCode: any, errorMsg: any): any {
    return {
      mainTitle: mainTitle,
      subTitle: errorMsg,
      description: '[' + MYT_FARE_ERROR_MSG.MSG_CODE + ' : ' + errorCode + ']',
      centerName: '',
      centerUrl: ''
    };
  }
}

export default MyTFareBillSkpayResult;
