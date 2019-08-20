/**
 * @filemyt-fare.bill.skpay.result.prepay.controller.ts
 * @file SK pay 결과 처리
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.08.20
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_FARE_ERROR_MSG } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Query {
  orderNumber: string;
  source: string;
  previousAmount: string;
  afterAmount: string;
  rechargeAmount: string;
  sms: string;
  email: string;
  amtCd: string;
  mb: string;
}

interface ResultJsonError {
  code: string;
  message: string;
}
interface ResultJson {
  paymentTokenIdentifier: string;
  paymentToken: string;
}
class MyTDataPrepaidSKpayResult extends TwViewController {
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
      orderNumber: req.query.dataKey,
      source: req.query.source,
      previousAmount: req.query.previousAmount,
      afterAmount: req.query.afterAmount,
      rechargeAmount: req.query.rechargeAmount,
      sms: req.query.sms,
      email: req.query.email,
      amtCd: req.query.amtCd,
      mb: req.query.mb
    };
    var status = req.body.status;
    var result = req.body.result;
    var paymentToken = '';
    var resultUtf = '';
    var codeError = '';
    var renderUrl = 'prepaid/myt-data.prepaid.skpay.result.html';
    const urlVoice = 'voice';
    const urlData = 'data';

    resultUtf = this.getResultUtf(result, resultUtf);

    if (status == 200) {
      paymentToken = this.getPaymentToken(resultUtf, paymentToken);
      let data = this.getDataApi(query, paymentToken, urlData);
      if (query.source && query.source === urlVoice) {
        this.apiService.request(API_CMD.BFF_06_0086, data).subscribe((createInfo) => {
          if (createInfo.code === API_CODE.CODE_00 && createInfo.result.successYn === 'Y') {
            return res.redirect('/myt-data/recharge/prepaid/voice-complete?type=voice&previousAmount=' + query.previousAmount + '&afterAmount=' + query.afterAmount + '&rechargeAmount='+ query.rechargeAmount);
          } else {
            return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, createInfo.code, MYT_FARE_ERROR_MSG.MSG_SYSTEM), { pageInfo }));
          }
        });
      } else if (query.source && query.source === urlData) {
        this.apiService.request(API_CMD.BFF_06_0087, data).subscribe((createInfo) => {
          if (createInfo.code === API_CODE.CODE_00 && createInfo.result.successYn === 'Y') {
              return res.redirect('/myt-data/recharge/prepaid/data-complete?data=' + query.mb);
          } else {
            return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE,  createInfo.code, MYT_FARE_ERROR_MSG.MSG_SYSTEM), { pageInfo }));
          }
        });
      }
    } else {
      if (resultUtf) {
        let resultJsonError: ResultJsonError = JSON.parse(resultUtf);
        codeError = resultJsonError.code;
      }
      if (codeError === 'USER_EXIT') { //USER_EXIT 사용자 취소
        return res.redirect('/myt-data/submain');
      } else if (codeError === 'BAD_REQUEST') { //BAD_REQUEST 잘못된 요청
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), { pageInfo }));
      } else if (codeError === 'EXCEPTION') { //EXCEPTION 11 Pay 내부 오류
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), { pageInfo }));
      } else { //정의되지 않은 오류
        return res.render(renderUrl, Object.assign(this._getDataError(MYT_FARE_ERROR_MSG.TITLE, codeError, MYT_FARE_ERROR_MSG.MSG_TEMP), { pageInfo }));
      }
    }
  }

  private getResultUtf(result: any, resultUtf: string) {
    if (result) {
      resultUtf = new Buffer(result, 'base64').toString('utf-8');
    }
    return resultUtf;
  }

  private getDataApi(query: Query, paymentToken: string, urlData: string) {
    if (query.source && query.source === urlData) {
      return {
        orderNumber: query.orderNumber,
        paymentToken: paymentToken,
        smsYn: query.sms,
        emailYn: query.email,
        amtCd: query.amtCd
      };
    } else {
      return {
        orderNumber: query.orderNumber,
        paymentToken: paymentToken,
        smsYn: query.sms,
        emailYn: query.email
      };
    }
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
}

export default MyTDataPrepaidSKpayResult;