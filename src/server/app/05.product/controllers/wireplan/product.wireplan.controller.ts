/**
 * @file 인터넷/집전화/IPTV < 상품
 * @author Jiyoung Jo
 * @since 2018.11.05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

/**
 * @class
 * @desc 상품 > 인터넷/ 전화/ IPTV
 */
export default class ProductWire extends TwViewController {
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
    this._getMyWireInfo(svcInfo).subscribe(myWire => {
      if (myWire && myWire.code) {
        return this.error.render(res, {
          ...myWire,
          pageInfo,
          svcInfo
        });
      }

      res.render('wireplan/product.wireplan.html', { svcInfo, pageInfo, myWire });
    });
  }

  /**
   * @desc 나의 가입 유선 상품 요청
   * @param {any} svcInfo 세션 정보
   * @private
   */
  private _getMyWireInfo = svcInfo => {
    if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
      return this.apiService.request(API_CMD.BFF_05_0179, {}).map(resp => {
        if (resp.code !== API_CODE.CODE_00) {
          return resp;
        }
        return {
          prodNm: svcInfo.prodNm,
          count: Number(resp.result.additionCount)
        };
      });
    }

    return of(undefined);
  }
}
