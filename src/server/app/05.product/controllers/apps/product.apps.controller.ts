/**
 * @file product.apps.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.09
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

/**
 * @class
 * @desc 상품 > T앱
 */
export default class ProductApps extends TwViewController {
  /**
   * @desc 화면 랜더링
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('apps/product.apps.html', { svcInfo, pageInfo, isApp: BrowserHelper.isApp(req) });
  }
}
