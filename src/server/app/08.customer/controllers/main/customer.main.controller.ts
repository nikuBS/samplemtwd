/**
 * FileName: customer.main.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { combineLatest } from 'rxjs/observable/combineLatest';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any): void {
    combineLatest(
      this.getBanners(),
      this.getNotice()
    ).subscribe(([banners, notice]) => {
      const noticeList = this.parseNoticeList(BrowserHelper.isApp(req), notice);
      res.render('main/customer.main.html', {
        isApp: BrowserHelper.isApp(req),
        svcInfo: svcInfo,
        banners: banners,
        noticeList: noticeList,
        pageInfo: pageInfo
        // researchList: researchList
      });
    });
  }

  private parseNoticeList(isApp, notice) {
    if ( isApp ) {
      return notice.result.content.splice(0, 3);
    }
    return notice.result.content.splice(0, 6);
  }

  private getBanners() {
    return this.apiService.request(API_CMD.BFF_08_0026, {});
  }

  private getResearch() {
    return this.apiService.request(API_CMD.BFF_08_0025, {});
  }

  private getNotice() {
    return this.apiService.request(API_CMD.BFF_08_0029, { expsChnlCd: 'M' });
  }
}

export default CustomerMain;
