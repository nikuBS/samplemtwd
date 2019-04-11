/**
 * @file common.share.app-install.info.controller.ts
 * @author Jayoon Kong
 * @since 2018.12.05
 * @desc App 설치 유도 페이지
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 * @desc App 설치 유도
 */
class CommonShareAppInstallInfo extends TwViewController {
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
  render(req: Request, res: Response, next: NextFunction,  svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('share/common.share.app-install.info.html', { isAndroid: BrowserHelper.isAndroid(req), pageInfo });

  }
}
export default CommonShareAppInstallInfo;
