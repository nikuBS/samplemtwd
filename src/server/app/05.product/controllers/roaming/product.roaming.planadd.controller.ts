/**
 * FileName: product.roaming.planadd.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.11.26
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import ProductHelper from '../../../../utils/product.helper';

class ProductRoamingPlanAdd extends TwViewController {

    constructor() {
        super();
    }

    private CAT_CODE = 'F01600';

    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
        const params = {
            idxCtgCd: this.CAT_CODE,
            ...(req.query.filters ? { searchFltIds: req.query.filters } : {}),
            ...(req.query.order ? { searchOrder: req.query.order } : {}),
            ...(req.query.tag ? { searchTagId: req.query.tag } : {})
        };

        if (this.isLogin(svcInfo)) {
            Observable.combineLatest(
                this.getRoamingPlanAddCntData(),
                this.getRoamingPlanAddData(params)
            ).subscribe(([roamingAddCntData, roamingAddData]) => {
                this.logger.info(this, 'roamingAddData : ', roamingAddData);

                const error = {
                    code: roamingAddData.code || roamingAddCntData.code,
                    msg: roamingAddData.msg || roamingAddCntData.msg
                };

                if ( error.code ) {
                    return this.error.render(res, { ...error, svcInfo, pageInfo });
                }

                res.render('roaming/product.roaming.planadd.html',
                    { svcInfo, roamingAddCntData, roamingAddData, params, isLogin: this.isLogin(svcInfo), pageInfo });

            });
        } else {
            Observable.combineLatest(
                                this.getRoamingPlanAddData(params)
            ).subscribe(([roamingAddData]) => {
                this.logger.info(this, 'roamingAddData : ', roamingAddData);

                const error = {
                    code: roamingAddData.code,
                    msg: roamingAddData.msg
                };

                if ( error.code ) {
                    return this.error.render(res, { ...error, svcInfo, pageInfo });
                }

                res.render('roaming/product.roaming.planadd.html',
                    { svcInfo, roamingAddData, params, isLogin: this.isLogin(svcInfo), pageInfo });

            });

        }


    }

  private isLogin(svcInfo: any): boolean {
      if (FormatHelper.isEmpty(svcInfo)) {
          return false;
      }
      return true;
  }
  private getRoamingPlanAddCntData(): Observable<any> {
      let roamingPlanAddCntData = null;
      return this.apiService.request(API_CMD.BFF_10_0121, {}).map((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
              roamingPlanAddCntData = resp.result;
              this.logger.info(this, 'roamingPlanAddCntData', roamingPlanAddCntData);
              return roamingPlanAddCntData;
          } else {
              return {
                  code: resp.code,
                  msg: resp.msg
              };
          }

      });
  }
  private getRoamingPlanAddData(params) {
      // let roamingPlanData = null;
      return this.apiService.request(API_CMD.BFF_10_0031, params).map((resp) => {
          this.logger.info(this, 'result ', resp.result);
          if ( resp.code === API_CODE.CODE_00 ) {
              return {
                  ...resp.result,
                  productCount: resp.result.productCount,
                  products: resp.result.products.map(roamingPlanAdd => {
                      return {
                          ...roamingPlanAdd,
                          basFeeAmt: ProductHelper.convProductBasfeeInfo(roamingPlanAdd.basFeeAmt)
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

export default ProductRoamingPlanAdd;

