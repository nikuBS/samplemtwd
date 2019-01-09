/**
 * FileName: product.roaming.join.roaming-alarm.controller.ts
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


class ProductRoamingJoinRoamingAlarm extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || null;


    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    Observable.combineLatest(
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId])
    ).subscribe(([ prodRedisInfo, prodApiInfo ]) => {

      if (FormatHelper.isEmpty(prodRedisInfo) || (prodApiInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: prodApiInfo.code,
          msg: prodApiInfo.msg,
        });
      }

      res.render('roaming/join/product.roaming.join.roaming-alarm.html', {
        svcInfo : svcInfo,
        prodRedisInfo : prodRedisInfo.result.summary,
        prodApiInfo : prodApiInfo.result,
        prodId : prodId,
        phoneNum : StringHelper.phoneStringToDash(svcInfo.svcNum),
        pageInfo : pageInfo
      });
    });

  }
}

export default ProductRoamingJoinRoamingAlarm;

