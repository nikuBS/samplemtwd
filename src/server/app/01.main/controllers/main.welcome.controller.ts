/**
 * @file main.welcome.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.06
 * @desc 메인 > Welcome
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_CODE } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';
import ProductHelper from '../../../utils/product.helper';

/**
 * @desc Welcome class
 */
class Welcome extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Welcome 렌더 함수
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @param {object} svcInfo
   * @param {object} allSvc
   * @param {object} childInfo
   * @param {object} pageInfo
   * @return {void}
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest([
      this._getBestAdditions() // SK텔레콤의 대표 부가서비스
    ]).subscribe(([bestAdditions, appList]) => {
      const productData = {
        bestAdditions,
      };
      res.render(`main.welcome.html`, {
        pageInfo,
        productData
      });
    });
  }

  /**
   * @desc SK텔레콤의 대표 부가서비스 요청
   * @private
   */
  private _getBestAdditions = () => {
    return this.apiService.request(API_CMD.BFF_10_0027, { idxCtgCd: PRODUCT_CODE.MOBILE_ADDITION }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      if (FormatHelper.isEmpty(resp.result)) {
        return resp.result;
      }

      return {
        ...resp.result,
        prodList: (resp.result.prodList || []).map(addition => {
          return {
            ...addition,
            basFeeInfo: ProductHelper.convProductBasfeeInfo(addition.basFeeInfo),
            prodIconImgUrl: addition.prodIconImgUrl && ProductHelper.getImageUrlWithCdn(addition.prodIconImgUrl)
          };
        })
      };
    });
  }
}

export default Welcome;
