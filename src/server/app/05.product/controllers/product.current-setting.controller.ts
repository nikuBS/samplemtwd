/**
 * FileName: product.current-setting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class ProductCurrentSetting extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    //
  }
}

export default ProductCurrentSetting;
