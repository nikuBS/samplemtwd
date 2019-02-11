/**
 * FileName: customer.main.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
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
        svcInfo: svcInfo,
        banners: banners,
        pageInfo: pageInfo,
        noticeList: noticeList,
        isApp: BrowserHelper.isApp(req)
        // researchList: researchList
      });
    });
  }

  private parseNoticeList = (isApp, notice) => isApp ? notice.content.splice(0, 3) : notice.content.splice(0, 6);

  private getBanners = () => this.apiService.request(API_CMD.BFF_08_0066, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })

  private getResearch = () => this.apiService.request(API_CMD.BFF_08_0025, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })

  private getNotice = () => this.apiService.request(API_CMD.BFF_08_0029, { expsChnlCd: 'M', ntcAreaClCd: 'M' })
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })
}

export default CustomerMain;
