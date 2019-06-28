/**
 * @file myt-fare.bill.skpay.result.controller.ts
 * @file SK pay 결과 처리
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_FARE_ERROR_MSG } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_FARE_COMPLETE_MSG } from '../../../../types/string.type';

interface Query {
  orderNumber: string;
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
    var status = req.body.status;
    var result = req.body.result;
    var paymentToken = '';
    var resultUtf = '';
    var codeError = '11sterror';
    var historyDepth = -3;
    var renderUrl = 'bill/myt-fare.bill.skpay.result.html';

    resultUtf = this.getResultUtf(result, resultUtf);
    if (status == 200) {
      paymentToken = this.getPaymentToken(resultUtf, paymentToken);
    } else {
      codeError = this.getCodeError(resultUtf, codeError);
      console.log('===========================================1');
      console.log(codeError);


      if (codeError === 'USER_EXIT') { //USER_EXIT 사용자 취소
        return res.render(renderUrl, Object.assign(this._getDataError('USER_EXIT', ''), { pageInfo, historyDepth }));
      } else {
        return res.render(renderUrl, Object.assign(this._getDataError('MSG_TEMP', codeError), { pageInfo, historyDepth }));
      }
    }

    let data = this.getDataApi(query, paymentToken);
    this.apiService.request(API_CMD.BFF_07_0097, data).subscribe((createInfo) => {
      if (createInfo.code === API_CODE.CODE_00 && createInfo.result.successYn === 'Y') {
        historyDepth = -4;
        return res.render(renderUrl, Object.assign(this._getDataError('PAY_COMPLETE', ''), { pageInfo, historyDepth }));
      } else {
        return res.render(renderUrl, Object.assign(this._getDataError('MSG_SYSTEM', createInfo.code), { pageInfo, historyDepth }));
        // return this.error.render(res, {
        //   title: MYT_PAYMENT_SKPAY.TITLE,
        //   code: createInfo.code,
        //   msg: createInfo.msg,
        //   pageInfo: pageInfo,
        //   svcInfo: svcInfo
        // });
      }
    });
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

  private getCodeError(resultUtf: string, codeError: string) {
    // '{"code":"USER_EXIT","message":"사용자가 SK pay를 종료하였습니다."}'
    interface ResultJsonError {
      code: string;
      message: string;
    }
    if (resultUtf) {
      let resultJsonError: ResultJsonError = JSON.parse(resultUtf);
      codeError = resultJsonError.code;
    }
    return codeError;
  }

  private getPaymentToken(resultUtf: string, paymentToken: string) {
    interface ResultJson {
      paymentTokenIdentifier: string;
      paymentToken: string;
    }
    if (resultUtf) {
      var resultText2 = JSON.parse(resultUtf);
      if (resultText2) {
        let resultJson: ResultJson = JSON.parse(resultText2);
        paymentToken = resultJson.paymentToken;
      }
    }
    return paymentToken;
  }
  /**
   * @function
   * @desc get data
   * @param queryObject
   * @returns {any}
   * @private
   */
  private _getDataError(queryObject: any, errorCode: any): any {
    var _mainTitle = MYT_FARE_ERROR_MSG.TITLE;
    var _msg = '';
    var _error = '[' + MYT_FARE_ERROR_MSG.MSG_CODE + " : " + errorCode + ']';
    var _centerName = '';
    var _centerUrl = '';

    if (queryObject === 'MSG_SYSTEM') {
      _msg = MYT_FARE_ERROR_MSG.MSG_SYSTEM;
    } else if (queryObject === 'MSG_TIME') {
      _msg = MYT_FARE_ERROR_MSG.MSG_TIME;
    } else if (queryObject === 'MSG_TEMP') {
      _msg = MYT_FARE_ERROR_MSG.MSG_TEMP;
      _error = '';
    } else if (queryObject === 'PAY_COMPLETE') {
      _mainTitle = MYT_FARE_COMPLETE_MSG.PAYMENT
      _msg = '';
      _error = '';
      _centerName = MYT_FARE_COMPLETE_MSG.HISTORY; // 중간 링크 버튼이 있을 경우 버튼명
      _centerUrl = '/myt-fare/info/history'; // 중간 링크 클릭 시 이동할 대상
    } else if (queryObject === 'USER_EXIT') {
      _msg = '';
      _error = '';
    }

    let data = {
      mainTitle: _mainTitle, // 메인 타이틀
      subTitle: _msg,
      description: _error,
      centerName: _centerName,
      centerUrl: _centerUrl
    };
    return data;
  }
}

export default MyTFareBillSkpayResult;