/**
 * @file product.roaming.setting.roaming-setup.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.11.28
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../../types/redis.type';


class ProductRoamingJoinRoamingSetup extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;
    const promotionProdIdArr = ['NA00005632', 'NA00005634', 'NA00005635'];
    const isPromotion = promotionProdIdArr.indexOf(prodId) > -1;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId])
    ).subscribe(([ preCheckInfo, prodTypeInfo, prodApiInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, prodTypeInfo, prodApiInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck : true
        });
      }

      res.render('roaming/join/product.roaming.join.roaming-setup.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodApiInfo : prodApiInfo.result,
        prodId : prodId,
        pageInfo : pageInfo,
        isPromotion : isPromotion
      });
    });


  }
}

export default ProductRoamingJoinRoamingSetup;

