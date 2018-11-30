/**
 * FileName: product.roaming.do.search-before.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class ProductRoamingSearchBefore extends TwViewController {
    constructor() {
        super();
    }

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
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

