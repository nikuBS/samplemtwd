/**
 * @file 전체메뉴 -> 설정 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-02
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import { ISvcInfo } from '../../../../../models/svc-info.model';

export default class MainMenuSettings extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: ISvcInfo,
         allSvc: any, childInfo: any, pageInfo: any) {

    const xRequestedWith = req.header('x-requested-with') || '';
    
    res.render('menu/settings/main.menu.settings.html', {
      svcInfo,
      pageInfo,
      isApp: BrowserHelper.isApp(req),
      isLogin: this.isLogin(svcInfo),
      // isRegularMember: !!svcInfo && parseInt(svcInfo.expsSvcCnt, 10) > 0,
      isTidLogin: !!svcInfo && svcInfo.loginType === 'T',
      xRequestedWith
    });
  }

  /**
   * @function
   * @desc 현재 사용자가 app/mweb 여부를 판단하여 return
   * @param  {any} svcInfo - 사용자 정보
   * @returns boolean - true: app, false: mweb
   */
  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }
}
