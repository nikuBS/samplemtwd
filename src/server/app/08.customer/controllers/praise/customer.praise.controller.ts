/**
 * @file 칭찬합니다 < 고객의견 < 이용안내
 * @author Jiyoung Jo
 * @since 2018.10.22
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 고객센터 > 칭찬합니다
 */
export default class CustomerPraise extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @desc 화면랜더링
   * @param  {Request} _req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('praise/customer.praise.html', { svcInfo, pageInfo });
  }
}
