/**
 * @file myt-data.prepaid.data.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.28
 * @desc 선불폰 데이터 1회 충전 페이지
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 * @desc 선불폰 데이터 1회 충전
 */
class MyTDataPrepaidData extends TwViewController {
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
    if (BrowserHelper.isApp(req)) { // 앱일 경우에만 진입 가능
      res.render('prepaid/myt-data.prepaid.data.html', {
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    } else { // 모바일웹일 경우 앱 설치 유도 페이지로 이동
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }
}

export default MyTDataPrepaidData;
