/**
 * @file [목소리인증하기]
 * @author Lee Kirim
 * @since 2018-10-24
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';

class CustomerVoice extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, _childInfo: any, pageInfo: any): void {
    const page = req.params.page; // query string 으로 정보 받음
    // 렌더링에 사용할 데이터 
    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req),
      convertTelFormat: this.convertTelFormat,
      allSvc: allSvc
    };

    switch ( page ) {
      case 'info':
        res.render('voice/customer.voice.info.html', responseData);
        break;
      case 'register':
        res.render('voice/customer.voice.register.html', responseData);
        break;
      case 'complete':
        res.render('voice/customer.voice.complete.html',
          Object.assign(
            responseData,
            { targetNum: req.query.targetNum }
          ));
        break;
      default:
        res.render('voice/customer.voice.html', responseData);
    }
  }

  /**
   * @function
   * @desc 전화번호 형식으로 변경
   * @param {string | number} sPhoneNumber
   * @returns {string} nnn-nnn-nnnn
   */
  public convertTelFormat = (sPhoneNumber: string | number): string => FormatHelper.conTelFormatWithDash(sPhoneNumber);
}

export default CustomerVoice;
