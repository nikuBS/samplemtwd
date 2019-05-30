/**
 * @file myt-fare.bill.point.controller.ts
 * @author Jayoon Kong
 * @editor 양정규
 * @since 2018.09.18
 * @desc 포인트 요금납부 page
 */

import {NextFunction, Request, Response} from 'express';
import {API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_PAYMENT_TITLE} from '../../../../types/bff.type';
import BrowserHelper from '../../../../utils/browser.helper';
import MyTFareBillPaymentCommon from './myt-fare.bill.payment.common.controller';

/**
 * @class
 * @desc 포인트 요금납부
 */
class MyTFareBillPoint extends MyTFareBillPaymentCommon {

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
      title: MYT_FARE_PAYMENT_TITLE.OKCASHBAG,
      svcInfo: svcInfo, // 회선정보 (필수 데이터)
      pageInfo: pageInfo // 페이지정보 (필수 데이터)
    };

    if (BrowserHelper.isApp(req)) { // 앱 환경 여부 체크
      this.getUnpaidList().subscribe((unpaidList) => { // 미납요금 대상자 조회
        if (unpaidList.code === API_CODE.CODE_00) {
          res.render('bill/myt-fare.bill.point.html', {
            ...data,
            unpaidList: this.parseData(unpaidList.result, svcInfo, allSvc),
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
}

export default MyTFareBillPoint;
