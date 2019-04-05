/**
 * MenuName: T로밍 > 국가별 로밍 요금조회 검색 전 화면 (RM_03_01_01_01)
 * FileName: product.roaming.do.search-before.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class ProductRoamingSearchBefore extends TwViewController {
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
        res.render('roaming/product.roaming.do.search-before.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo) });
    }

    private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
}

export default ProductRoamingSearchBefore;

