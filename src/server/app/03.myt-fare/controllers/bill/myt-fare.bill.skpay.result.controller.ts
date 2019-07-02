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
    var status = req.body.status;
    var result = req.body.result;
    var paymentToken = '';
    var resultUtf = '';
    var codeError = '';
    var msgError = '';
    var historyDepth = -3;
    var renderUrl = 'bill/myt-fare.bill.skpay.result.html';

    return res.render(renderUrl, Object.assign(this._getDataDebug('TEST', JSON.stringify(req.headers), JSON.stringify(req.body)), { pageInfo, historyDepth }));

    resultUtf = this.getResultUtf(result, resultUtf);
    
    if (status == 200) {
      paymentToken = this.getPaymentToken(resultUtf, paymentToken);
      let data = this.getDataApi(query, paymentToken);
      this.apiService.request(API_CMD.BFF_07_0097, data).subscribe((createInfo) => {
        if (createInfo.code === API_CODE.CODE_00 && createInfo.result.successYn === 'Y') {
          return res.redirect('/myt-fare/bill/pay-complete');
          // historyDepth = -4;
          // return res.render(renderUrl, Object.assign(this._getDataComplete(), { pageInfo, historyDepth }));
        } else {
          // return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE,  createInfo.code, MYT_FARE_ERROR_MSG.MSG_SYSTEM + " " + createInfo.msg), { pageInfo, historyDepth }));
          return this.error.render(res, { title: MYT_FARE_ERROR_MSG.TITLE, code: createInfo.code, msg: createInfo.msg, pageInfo: pageInfo, svcInfo: svcInfo });
        }
      });
    } else {
      // '{"code":"USER_EXIT","message":"사용자가 SK pay를 종료하였습니다."}'
      if (resultUtf) {
        let resultJsonError: ResultJsonError = JSON.parse(resultUtf);
        codeError = resultJsonError.code;
        msgError = resultJsonError.message;
      }
      if (codeError === 'USER_EXIT') { //USER_EXIT 사용자 취소
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.USEREXIT, codeError, msgError), { pageInfo, historyDepth }));
      } else if (codeError === 'BAD_REQUEST') { //BAD_REQUEST 잘못된 요청
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP + " " + msgError), { pageInfo, historyDepth }));
      } else if (codeError === 'EXCEPTION') { //EXCEPTION 11 Pay 내부 오류
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP + " " + msgError), { pageInfo, historyDepth }));
      } else {
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP + " " + msgError), { pageInfo, historyDepth }));
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
  private _getDataComplete(): any {
    var _mainTitle = MYT_FARE_COMPLETE_MSG.PAYMENT
    var  _centerName = MYT_FARE_COMPLETE_MSG.HISTORY; // 중간 링크 버튼이 있을 경우 버튼명
    var _centerUrl = '/myt-fare/info/history'; // 중간 링크 클릭 시 이동할 대상

    let data = {
      mainTitle: _mainTitle, // 메인 타이틀
      subTitle: '',
      description: '',
      centerName: _centerName,
      centerUrl: _centerUrl
    };
    return data;
  }
  /**
   * @function
   * @desc get data
   * @param queryObject
   * @returns {any}
   * @private
   */
  private _getDataError(mainTitle: any, errorCode: any, errorMsg: any): any {
    var _error = '[' + MYT_FARE_ERROR_MSG.MSG_CODE + " : " + errorCode + ']';
    let data = {
      mainTitle: mainTitle,
      subTitle: errorMsg,
      description: _error,
      centerName: '',
      centerUrl: ''
    };
    return data;
  }
  private _getDataDebug(mainTitle: any, errorCode: any, errorMsg: any): any {
    var _error = errorCode;
    let data = {
      mainTitle: mainTitle,
      subTitle: errorMsg,
      description: _error,
      centerName: '',
      centerUrl: ''
    };
    return data;
  }
}

export default MyTFareBillSkpayResult;