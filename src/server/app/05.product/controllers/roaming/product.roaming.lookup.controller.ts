/**
 * FileName: product.roaming.lookup.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';

class ProductRoamingLookup extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {

  const prodId = req.query.prodId || null;

  if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
      });
  }

  this.apiService.request(API_CMD.BFF_10_0091, {}, {}, prodId)
  .subscribe(( prodBffInfo ) => {
    console.log('test bff');
    console.log(prodBffInfo);
    if (FormatHelper.isEmpty(prodBffInfo)) {
        return this.error.render(res, {
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN
        });
    }
      res.render( 'roaming/product.roaming.lookup.html', {
          svcInfo : svcInfo,
          prodBffInfo : prodBffInfo.result
        }
      );
  });



  }
}

export default ProductRoamingLookup;

