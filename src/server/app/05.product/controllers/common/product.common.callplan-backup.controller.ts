/**
 * 상품 원장 URL PathVariable Backup. 방어용
 * FileName: product.common.callplan-backup.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { MYT_JOIN_WIRE_SVCATTRCD, PRODUCT_TYPE_NM } from '../../../../types/string.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class ProductCommonCallplanBackup extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.redirect('/product/callplan?prod_id=' + req.params.prodId);
  }
}

export default ProductCommonCallplanBackup;
