/**
 * 이용안내 > 이용자피해예방센터 > 유용한 부가서비스
 * @file customer.damage-info.additions.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerDamageInfoAdditions extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('damage-info/customer.damage-info.additions.html', {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo, // 페이지 정보
      isApp: BrowserHelper.isApp(req),  // 앱 여부
      isAndroid: BrowserHelper.isAndroid(req) // 안드로이드 여부
    });
  }
}

export default CustomerDamageInfoAdditions;
