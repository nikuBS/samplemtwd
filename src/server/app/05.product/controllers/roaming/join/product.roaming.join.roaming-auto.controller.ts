/**
 * FileName: product.roaming.setting.roaming-auto.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {ROAMING_AUTO_EXPIRE_CASE} from '../../../../../types/bff.type';


class ProductRoamingJoinRoamingAuto extends TwViewController {
  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {

    const prodId = req.query.prod_id || null;
    let expireDate = '';

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId])
    ).subscribe(([ prodTypeInfo, prodApiInfo, prodServiceTimeInfo ]) => {
      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodApiInfo.code !== API_CODE.CODE_00) || (prodServiceTimeInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodApiInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodApiInfo.msg,
          isBackCheck : prodApiInfo.code === 'ZINVE8101' ? true : false
        });
      }

      if (prodServiceTimeInfo.result.startEndTerm) {
        expireDate = prodServiceTimeInfo.result.startEndTerm;
      } else {
        expireDate = ROAMING_AUTO_EXPIRE_CASE[prodId];
      }


      res.render('roaming/join/product.roaming.join.roaming-auto.html', {
        svcInfo : this.loginService.getSvcInfo(),
        prodTypeInfo : prodTypeInfo.result,
        prodApiInfo : prodApiInfo.result,
        prodId : prodId,
        expireDate : expireDate,
        pageInfo : pageInfo
      });
    });




  }
}

export default ProductRoamingJoinRoamingAuto;

