/**
 * @file product.roaming.setting.roaming-alarm.controller.ts
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


class ProductRoamingSettingRoamingAlarm extends TwViewController {
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
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0021, {}, {}, [prodId]),
    ).subscribe(([ prodTypeInfo, prodBffInfo ]) => {
      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodBffInfo.code !== API_CODE.CODE_00) ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.SETTING,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodBffInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodBffInfo.msg,
        });
      }
      for (let i = 0; i < prodBffInfo.result.combinationLineList.length; i++) {
        prodBffInfo.result.combinationLineList[i].svcNumMask = StringHelper.phoneStringToDash(prodBffInfo.result.combinationLineList[i].svcNumMask);
      }

      res.render('roaming/setting/product.roaming.setting.roaming-alarm.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        phoneNum : StringHelper.phoneStringToDash(svcInfo.svcNum),
        pageInfo : pageInfo
      });
    });


  }
}

export default ProductRoamingSettingRoamingAlarm;

