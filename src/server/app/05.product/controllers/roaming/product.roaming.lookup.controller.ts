/**
 * FileName: product.roaming.lookup.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';

class ProductRoamingLookup extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.CALLPLAN
      });
    }

    this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId])
      .subscribe(( prodBffInfo ) => {
        if (prodBffInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            title: PRODUCT_TYPE_NM.CALLPLAN,
            code: prodBffInfo.code,
            msg: prodBffInfo.msg
          });
        }
        res.render( 'roaming/product.roaming.lookup.html', {
            svcInfo : svcInfo,
            prodBffInfo : prodBffInfo.result,
            prodId : prodId,
            pageInfo : pageInfo
          }
        );
      });



  }
}

export default ProductRoamingLookup;

