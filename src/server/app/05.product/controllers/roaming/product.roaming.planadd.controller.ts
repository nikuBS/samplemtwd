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
            ...(req.query.tag ? { searchTagId: req.query.tag } : {})
        };

        Observable.combineLatest(
            this.getRoamingPlanAddCntData(),
            this.getRoamingPlanAddData(params)
        ).subscribe(([roamingAddCntData, roamingAddData]) => {
            this.logger.info(this, 'roamingAddData : ', roamingAddData);
            res.render('roaming/product.roaming.planadd.html',
                { svcInfo, roamingAddCntData, roamingAddData, params, isLogin: this.isLogin(svcInfo), pageInfo });

        });
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
          }
          this.logger.info(this, 'roamingPlanAddCntData', roamingPlanAddCntData);
          return roamingPlanAddCntData;
      });
  }
  private getRoamingPlanAddData(params) {
      // let roamingPlanData = null;
      return this.apiService.request(API_CMD.BFF_10_0000, params).map((resp) => {
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
          }
      });
  }
}

export default ProductRoamingPlanAdd;

