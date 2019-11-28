/**
 * @file 결합상품 < 상품
 * @author
 * @since 2019.11.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

/**
 * @class
 * @desc 상품 > 결합상품
 */
export default class ProductCombination extends TwViewController {
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

      res.render('combinations/product.combinations.html', { svcInfo, pageInfo });
  }
}
