/**
 * @file 서비스가능지역 조회 < 인터넷/집전화/IPTV < 상품
 * @author Jiyoung Jo (jiyoungjo@sk.com)
 * @since 2019.04.04
 */


import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 상품 > 인터넷/집전화/IPTV > 서비스가능지역 조회
 */
export default class ProductWireServiceArea extends TwViewController {
  constructor() {
    super();
  }
  
  /**
   * @desc 화면 랜더링
   * @param  {Request} _req
   * @param  {Response} res
   * @param  {NextFunction} _next
   * @param  {any} svcInfo
   * @param  {any} _allSvc
   * @param  {any} _childInfo
   * @param  {any} pageInfo
   */
  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render('wireplan/product.wireplan.service-area.html', { svcInfo, pageInfo });
  }
}
