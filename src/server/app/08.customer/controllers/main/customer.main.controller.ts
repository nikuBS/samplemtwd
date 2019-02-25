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
import { REDIS_KEY } from '../../../../types/redis.type';

class CustomerMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any): void {
    combineLatest(
      this.getBanners(),
      this.getNotice(req),
      this.getResearch()
    ).subscribe(([banners, notice, researchList]) => {
      const noticeList = this.parseNoticeList(BrowserHelper.isApp(req), notice);

      res.render('main/customer.main.html', {
        svcInfo: svcInfo,
        banners: banners,
        pageInfo: pageInfo,
        noticeList: noticeList,
        isApp: BrowserHelper.isApp(req),
        researchList: researchList
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

  // TODO: NOT YET VERIFIED: NOTICE API -> REDIS DATA from <doohj1@sk.com> by SMS 1weeks ago
  // private getBanners = () => this.redisService.getData(REDIS_KEY.SUBMAIN_BANNER)
  //   .map((resp) => {
  //     return resp.result;
  //   })

  private getResearch = () => this.apiService.request(API_CMD.BFF_08_0025, {})
    .map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    })

  private getNotice = (req) => {
    const expsChnlCd = this._getTworldChannel(req);

    return this.apiService.request(API_CMD.BFF_08_0029, {
      expsChnlCd: expsChnlCd,
      ntcAreaClCd: 'M'
    }).map((res) => {
      if ( res.code === API_CODE.CODE_00 ) {
        return res.result;
      } else {
        return null;
      }
    });
  }

  private _getTworldChannel(req): any {
    if ( BrowserHelper.isAndroid(req) ) {
      return 'A';
    }

    if ( BrowserHelper.isIos(req) ) {
      return 'I';
    }

    return 'M';
  }
}

export default CustomerMain;
