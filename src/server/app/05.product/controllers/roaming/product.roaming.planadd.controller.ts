/**
 * FileName: product.roaming.planadd.controller.ts
 * Author: Eunjung Jung
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class ProductRoamingPlanAdd extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render('roaming/product.roaming.planadd.html', { svcInfo, isLogin: this.isLogin(svcInfo) });
  }

  private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
}

export default ProductRoamingPlanAdd;

