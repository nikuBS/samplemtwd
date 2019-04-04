/**
 * @file myt-fare.bill.contents.auto.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.08
 * Description: 콘텐츠이용료 자동선결제 신청
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../../utils/browser.helper';

class MyTFareBillContentsAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) { // 앱인 경우에만 진입 가능
      this.getAutoPrepayInfo().subscribe((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          res.render('billcontents/myt-fare.bill.contents.auto.html', {
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
        svcInfo: svcInfo, pageInfo: pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  /* 콘텐츠이용료 자동선결제 정보 조회 */
  private getAutoPrepayInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0085, {});
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.comboStandardAmount = result.cmbAutoChrgStrdAmt / 10000; // 기준금액 만원단위로 표시
      result.comboChargeAmount = result.cmbAutoChrgAmt / 10000; // 선결제금액 만원단위로 표시
      result.comboMaxAmount = result.cmbMaxAmt / 10000; // 최대금액 만원단위로 표시
    }
    return result;
  }
}

export default MyTFareBillContentsAuto;
