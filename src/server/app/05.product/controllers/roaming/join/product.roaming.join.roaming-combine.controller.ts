/**
 * FileName: product.roaming.join.roaming-combine.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../../utils/string.helper';
import { REDIS_KEY } from '../../../../../types/redis.type';


class ProductRoamingJoinRoamingCombine extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this.apiService.request(API_CMD.BFF_10_0141, {}, {}),
    ).subscribe(([ preCheckInfo, prodRedisInfo, prodBffInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, prodRedisInfo, prodBffInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: apiError.code,
          msg: apiError.msg,
        });
      }

      for (let i = 0; i < prodBffInfo.result.togetherMemList.length; i++) {
        prodBffInfo.result.togetherMemList[i].svcNum = StringHelper.phoneStringToDash(prodBffInfo.result.togetherMemList[i].svcNum);
      }
      res.render('roaming/join/product.roaming.join.roaming-combine.html', {
        svcInfo : svcInfo,
        prodRedisInfo : prodRedisInfo.result.summary,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        phoneNum : StringHelper.phoneStringToDash(svcInfo.svcNum),
        pageInfo : pageInfo
      });
    });



  }
}

export default ProductRoamingJoinRoamingCombine;

