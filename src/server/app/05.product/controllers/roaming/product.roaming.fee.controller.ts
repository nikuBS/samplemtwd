/**
 * MenuName: T로밍 > 로밍 요금제 (RM_11)
 * @file product.roaming.fee.controller.ts
 * @author Eunjung Jung
 * @since 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';

export default class ProductRoamingFee extends TwViewController {
    constructor() {
        super();
    }

    private PLAN_CODE = 'F01500';

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

        const params = {
            idxCtgCd: this.PLAN_CODE,
            ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
            ...(req.query.order ? { searchOrder: req.query.order } : {}),
            ...(req.query.tag ? { searchTagId: req.query.tag } : {})
        };
        // 로그인한 사용자의 경우 나의 로밍 요금제 이용현황 데이터 요청.
        if (this.isLogin(svcInfo)) {
            Observable.combineLatest(
                this.getRoamingData(),
                this.getRoamingPlanData(params)
            ).subscribe(([roamingData, roamingPlanData]) => {

                const error = {
                    code: roamingPlanData.code || roamingData.code,
                    msg: roamingPlanData.msg || roamingData.msg
                };

                if ( error.code ) {
                    return this.error.render(res, { ...error, svcInfo, pageInfo });
                }

                res.render('roaming/product.roaming.fee.html',
                    { svcInfo, roamingData, roamingPlanData, params, isLogin: this.isLogin(svcInfo), pageInfo });

            });
        } else {
            Observable.combineLatest(
                this.getRoamingPlanData(params)
            ).subscribe(([roamingPlanData]) => {

                const error = {
                    code: roamingPlanData.code,
                    msg: roamingPlanData.msg
                };

                if ( error.code ) {
                    return this.error.render(res, { ...error, svcInfo, pageInfo });
                }

                res.render('roaming/product.roaming.fee.html',
                    { svcInfo, roamingPlanData, params, isLogin: this.isLogin(svcInfo), pageInfo });

            });
        }


    }

    private isLogin(svcInfo: any): boolean {
        if (FormatHelper.isEmpty(svcInfo)) {
            return false;
        }
        return true;
    }
    // 나의 로밍 요금제 이용현황 요청.
    private getRoamingData(): Observable<any> {
        let roamingData = null;
        return this.apiService.request(API_CMD.BFF_10_0122, {}).map((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
                roamingData = resp.result;
                this.logger.info(this, 'roamingData', roamingData);
                return roamingData;
            } else {
                return {
                    code: resp.code,
                    msg: resp.msg
                };
            }

        });
    }
    // 로밍 요금제 리스트 요청.
    private getRoamingPlanData(params) {
        // let roamingPlanData = null;
        return this.apiService.request(API_CMD.BFF_10_0031, params).map((resp) => {
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
            } else {
                return {
                    code: resp.code,
                    msg: resp.msg
                };
            }
        });
    }

}

