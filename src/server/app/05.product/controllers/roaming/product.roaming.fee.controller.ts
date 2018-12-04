/**
 * FileName: product.roaming.fee.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductRoaming extends TwViewController {
    constructor() {
        super();
    }

    private PLAN_CODE = 'F01500';

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

        const params = {
            idxCtgCd: this.PLAN_CODE,
            ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
            ...(req.query.tag ? { searchTagId: req.query.tag } : {})
        };

        Observable.combineLatest(
            this.getRoamingData(),
            this.getRoamingPlanData(params)
        ).subscribe(([roamingData, roamingPlanData]) => {

            res.render('roaming/product.roaming.fee.html', { svcInfo, roamingData, roamingPlanData, isLogin: this.isLogin(svcInfo), pageInfo });

        });
    }

    private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
    private getRoamingData(): Observable<any> {
        let roamingData = null;
        return this.apiService.request(API_CMD.BFF_10_0055, {}).map((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
                roamingData = resp.result;
                this.logger.info(this, 'roamingData', roamingData);
                return roamingData;
            }

        });
    }

    private getRoamingPlanData(params) {
        // let roamingPlanData = null;
        return this.apiService.request(API_CMD.BFF_10_0000, params).map((resp) => {
            this.logger.info(this, 'result ', resp.result);
            if ( resp.code === API_CODE.CODE_00 ) {
                return {
                    ...resp.result,
                    productCount : resp.result.productCount,
                    products: resp.result.products.map(roamingPlan => {
                        return {
                            ...roamingPlan,
                            basFeeAmt: ProductHelper.convProductBasfeeInfo(roamingPlan.basFeeAmt)
                        };
                    })
                };
            }
        });
    }
}

