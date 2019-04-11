/**
 * @file myt-data.prepaid.voice-info.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2019.02.20
 * @desc 선불 이동전화 카드금액 안내 페이지
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 * @desc 선불 이동전화 카드금액 안내
 */
class MyTDataPrepaidVoiceInfo extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( BrowserHelper.isApp(req) ) {
      this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo: pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }

    // this.renderPrepaidVoice(req, res, next, svcInfo, pageInfo);
  }

  /**
   * @function
   * @desc render prepaid voice
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param pageInfo
   */
  public renderPrepaidVoice = (req: Request, res: Response, next: NextFunction, svcInfo, pageInfo) =>
    res.render('prepaid/myt-data.prepaid.voice.info.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req)
    })

  /**
   * @function
   * @desc convert format from YYYYMMDD to YYYY.M.D.
   * @param sDate
   * @returns {string}
   */
  public convertDate = (sDate) => DateHelper.getShortDate(sDate);
}

export default MyTDataPrepaidVoiceInfo;
