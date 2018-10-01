/**
 * FileName: product.setting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';

class ProductDetail extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        title: '상품 설정',
        svcInfo: svcInfo
      });
    }

    // this.redisService.getData('ProductSettingInfo:' + this._prodId)
    //   .subscribe((productSettingInfo) => {
    //
    //   });

    res.render('product.setting.html', {
      svcInfo: svcInfo
    });
  }
}

export default ProductDetail;
