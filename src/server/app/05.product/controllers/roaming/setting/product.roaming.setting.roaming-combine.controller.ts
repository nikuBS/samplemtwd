/**
 * 로밍 종료일 자동설정 case 설정 변경
 * @file product.roaming.setting.roaming-combine.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.05
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../../utils/string.helper';
import { REDIS_KEY } from '../../../../../types/redis.type';


class ProductRoamingSettingRoamingCombine extends TwViewController {
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
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId),
      this.apiService.request(API_CMD.BFF_10_0141, {}, {}),
    ).subscribe(([ prodRedisInfo, prodBffInfo ]) => {
      if (FormatHelper.isEmpty(prodRedisInfo) || (prodBffInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.SETTING,
          code: prodBffInfo.code,
          msg: prodBffInfo.msg,
        });
      }
      for (let i = 0; i < prodBffInfo.result.togetherMemList.length; i++) {
        prodBffInfo.result.togetherMemList[i].svcNum = StringHelper.phoneStringToDash(prodBffInfo.result.togetherMemList[i].svcNum);
      }
      res.render('roaming/setting/product.roaming.setting.roaming-combine.html', {
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

export default ProductRoamingSettingRoamingCombine;

