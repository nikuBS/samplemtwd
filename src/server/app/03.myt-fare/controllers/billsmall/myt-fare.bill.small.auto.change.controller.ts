/**
 * @file myt-fare.bill.small.auto.change.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.05
 * @desc 소액결제 자동선결제 변경 page
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 * @desc 소액결제 자동선결제 변경
 */
class MyTFareBillSmallAutoChange extends TwViewController {
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
    if (BrowserHelper.isApp(req)) { // 앱인 경우에만 진입 가능
      this.getAutoPrepayInfo().subscribe((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          res.render('billsmall/myt-fare.bill.small.auto.change.html', {
            autoPrepayInfo: this.parseData(resp.result),
            svcInfo: svcInfo, // 회선 정보 (필수)
            pageInfo: pageInfo // 페이지 정보 (필수)
          });
        } else {
          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
    } else { // 모바일웹인 경우 앱 설치 유도 페이지로 이동
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  /**
   * @function
   * @desc 소액결제 자동선결제 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoPrepayInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0086, {});
  }

  /**
   * @function
   * @desc parsing data
   * @param result
   * @returns {any}
   */
  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      // OP002-1757 필드명 변경(cmb 프리픽스 제거). cmbAutoChrgStrdAmt, cmbAutoChrgAmt -> autoChrgStrdAmt, autoChrgAmt
      result.comboStandardAmount = result.autoChrgStrdAmt / 10000; // 기준금액 만원단위로 표시
      result.comboChargeAmount = result.autoChrgAmt / 10000; // 선결제금액 만원단위로 표시
      result.comboMaxAmount = result.cmbMaxAmt / 10000; // 최대금액 만원단위로 표시
    }
    return result;
  }
}

export default MyTFareBillSmallAutoChange;
