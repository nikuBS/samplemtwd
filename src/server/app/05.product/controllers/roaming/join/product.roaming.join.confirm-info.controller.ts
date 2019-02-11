/**
 * FileName: product.roaming.setting.roaming-setup.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.04
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../../utils/string.helper';


class ProductRoamingJoinConfirmInfo extends TwViewController {
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
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId])
    ).subscribe(([ prodTypeInfo, prodBffInfo ]) => {
      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodBffInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodBffInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodBffInfo.msg,
          isBackCheck : prodBffInfo.code === 'ZINVE8101' ? true : false
        });
      }

      res.render('roaming/join/product.roaming.join.confirm-info.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        maskingNum : StringHelper.phoneStringToDash(svcInfo.svcNum),
        pageInfo : pageInfo
      });
    });

  }
}

export default ProductRoamingJoinConfirmInfo;

