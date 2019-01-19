/**
 * FileName: product.roaming.terminate.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import { REDIS_KEY } from '../../../../types/redis.type';
import StringHelper from '../../../../utils/string.helper';


class ProductRoamingTerminate extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;


    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.TERMINATE
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '03'}, {}, [prodId])
    ).subscribe(([ prodTypeInfo, prodBffInfo ]) => {

      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodBffInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.TERMINATE,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodBffInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodBffInfo.msg
        });
      }

      res.render('roaming/product.roaming.terminate.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        pageInfo : pageInfo,
        maskingNum : StringHelper.phoneStringToDash(svcInfo.svcNum),
      });
    });
  }
}

export default ProductRoamingTerminate;

