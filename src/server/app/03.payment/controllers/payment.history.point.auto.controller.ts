/**
 * FileName: payment.history.point.auto.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.05
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../types/api-command.type';


class PaymentHistoryPointAutoController extends TwViewController {

  constructor() {
    super();
  }

  private dummyOCB = {
    'code': '00',
    'msg': 'success',
    'result': {
      'reqHis': [
        {
          'reqClCdNm': '신청',
          'procDt': '20180523',
          'endDt': '20190523',
          'reqAmt': '1000',
          'cardNum': '123************',
          'opSaleOrgIdNm': 'T월드 모바일 웹'
        }
      ],
      'payHist': [
        {
          'payOpTm': '20180523090102',
          'opDt': '20180523',
          'ppayAmt': '1000',
          'ppayBamt': '6000',
          'opSaleOrgNm': 'T월드 모바일 웹'
        }
      ]
    }
  };

  private dummyTpoint = {
    'code': '00',
    'msg': 'success',
    'result': {
      'reqHis': [
        {
          'reqClCdNm': '신청',
          'procDt': '20180523',
          'endDt': '20190523',
          'reqAmt': '1000',
          'cardNum': '123************',
          'opSaleOrgIdNm': 'T월드 모바일 웹'
        }
      ],
      'payHist': [
        {
          'payOpTm': '20180523090102',
          'opDt': '20180523',
          'ppayAmt': '1000',
          'ppayBamt': '6000',
          'opSaleOrgNm': 'T월드 모바일 웹'
        }
      ]
    }
  };
  private dummyRainbow = {
    'code': '00',
    'msg': 'success',
    'result': {
      'reqHis': [
        {
          'procDt': '20180523',
          'reqChgNm': '음성통화료',
          'reqClCdNm': '신청취소',
          'opSaleOrgIdNm': '모바일 Tworld'
        }
      ],
      'payHist': [
        {
          'out1InvDt': '20180523',
          'out1UseAmt': '1000',
          'remAmt': '6000',
          'out1OpOrgNm': 'T월드 모바일 웹'
        }
      ]
    }
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {



    res.render('payment.history.point.auto.html', {
      svcInfo: svcInfo,
      dummyOCB: this.dummyOCB.result,
      dummyTpoint: this.dummyTpoint.result,
      dummyRainbow: this.dummyRainbow.result
    });
  }

}

export default PaymentHistoryPointAutoController;
