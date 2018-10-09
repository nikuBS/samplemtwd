/**
 * FileName: product.join.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { PRODUCT_SETTING } from '../../../mock/server/product.display-ids.mock';
import FormatHelper from '../../../utils/format.helper';

class ProductJoin extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;
  private _displayId;

  /**
   * @private
   */
  private _setDisplayId(): any {
    let displayId: any = null;

    Object.keys(PRODUCT_SETTING).forEach((key) => {
      if (PRODUCT_SETTING[key].indexOf(this._prodId) !== -1) {
        displayId = key;
        return false;
      }
    });

    if (!FormatHelper.isEmpty(displayId)) {
      this._displayId = displayId;
    }
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;
    this._setDisplayId();

    res.render('product.join.html', {
      svcInfo: svcInfo,
      prodId: this._prodId,
      displayId: this._displayId
    });
  }
}

export default ProductJoin;
