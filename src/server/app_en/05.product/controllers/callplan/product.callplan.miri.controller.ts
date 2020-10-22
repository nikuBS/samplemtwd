/**
 * @file 요금제 < 상품
 * @author Jiyoung Jo
 * @since 2018.09.06
 */

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 상품 > 모바일 요금제 
 */
export default class CallplanMiri extends TwViewController {
  constructor() {
    super();
  }
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
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('callplan/en.product.callplan.miri.html', {svcInfo, pageInfo});
  }
}
