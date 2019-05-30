/**
 * 로밍 상품 가입 종료일 자동설정 case
 * @file product.roaming.setting.roaming-auto.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';


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
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.JOIN
      });
    }

    // T로밍 함께쓰기 6종 상품번호
    const useTogether = ['NA00005690', 'NA00005691', 'NA00005692', 'NA00005693', 'NA00005694', 'NA00005695'];
    const isUseTogether = useTogether.indexOf(prodId) > -1;

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, {'joinTermCd' : '01'}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId])
    ).subscribe(([ preCheckInfo, prodTypeInfo, prodApiInfo, prodServiceTimeInfo ]) => {
      const apiError = this.error.apiError([preCheckInfo, prodTypeInfo, prodApiInfo, prodServiceTimeInfo]);

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

      expireDate = prodServiceTimeInfo.result.startEndTerm;


      res.render('roaming/join/product.roaming.join.roaming-auto.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodApiInfo : prodApiInfo.result,
        prodId : prodId,
        expireDate : expireDate,
        pageInfo : pageInfo,
        isUseTogether : isUseTogether
      });
    });




  }
}

export default ProductRoamingJoinRoamingAuto;

