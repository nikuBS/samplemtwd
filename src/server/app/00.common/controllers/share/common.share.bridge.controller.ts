/**
 * @file common.share.bridge.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.11.20
 * @desc Common > Util > App 안내 화면
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

import client from 'cheerio-httpcli';


/**
 * @desc App 안내화면 초기화를 위한 class
 */
class CommonShareBridge extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > Util > App 안내 화면 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const target = req.query.target;
    const loginType = req.query.loginType;
    const referer = req.query.referer;

    client.fetch(`http://${req['headers']['host']}${req.query['target']}`, {}, function (err, $, response, body) {
      let title = $("meta[property='og:title']").attr('content')
      let description = $("meta[property='og:description']").attr('content')
      res.render('share/common.share.bridge.html', { 
        isAndroid: BrowserHelper.isAndroid(req), 
        target, 
        loginType, 
        referer, 
        pageInfo,
        ogTitle: title,
        ogDesc: description
      });

    });
    // const ogDesc = '';
    // res.render('share/common.share.bridge.html', { isAndroid: BrowserHelper.isAndroid(req), target, loginType, referer, pageInfo, ogDesc });
  }
}
export default CommonShareBridge;
