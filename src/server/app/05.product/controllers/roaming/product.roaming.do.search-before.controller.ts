/**
 * FileName: product.roaming.do.search-before.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class ProductRoamingSearchBefore extends TwViewController {
  render(req: Request, res: Response, svcInfo: any) {
    res.render('roaming/product.roaming.do.search-before.html', { svcInfo, isLogin: this.isLogin(svcInfo) });
  }

  private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
}

export default ProductRoamingSearchBefore;

