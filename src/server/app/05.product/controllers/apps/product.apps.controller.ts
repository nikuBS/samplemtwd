/**
 * FileName: product.apps.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.11.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import BrowserHelper from '../../../../utils/browser.helper';

export default class ProductApps extends TwViewController {
  private APPS_CODE = 'F01700';

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('apps/product.apps.html', { svcInfo, pageInfo, isApp: BrowserHelper.isApp(req) });
  }
}
