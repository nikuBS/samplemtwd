/**
 * 로밍상품 종료일 자동설정 case 설정 변경
 * @file product.roaming.setting.roaming-auto.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {PRODUCT_TYPE_NM} from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import DateHelper from '../../../../../utils/date.helper';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';


class ProductRoamingSettingRoamingAuto extends TwViewController {
  constructor() {
    super();
  }

  private serverDate = DateHelper.getCurrentShortDate();

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || null;
    let expireDate = '';

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: PRODUCT_TYPE_NM.SETTING
      });
    }

    // T로밍 함께쓰기 6종 상품번호
    const useTogether = ['NA00005690', 'NA00005691', 'NA00005692', 'NA00005693', 'NA00005694', 'NA00005695'];
    const isUseTogether = useTogether.indexOf(prodId) > -1;

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0091, {}, {}, [prodId])
    ).subscribe(([ prodTypeInfo, prodBffInfo ]) => {
      if ((prodTypeInfo.code !== API_CODE.CODE_00) || (prodBffInfo.code !== API_CODE.CODE_00)) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          title: PRODUCT_TYPE_NM.SETTING,
          code: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.code : prodBffInfo.code,
          msg: prodTypeInfo.code !== API_CODE.CODE_00 ? prodTypeInfo.msg : prodBffInfo.msg,
        });
      }

      expireDate = prodBffInfo.result.startEndTerm;


      res.render('roaming/setting/product.roaming.setting.roaming-auto.html', {
        svcInfo : svcInfo,
        prodTypeInfo : prodTypeInfo.result,
        prodBffInfo : prodBffInfo.result,
        prodId : prodId,
        expireDate : expireDate,
        pageInfo : pageInfo,
        isUseTogether : isUseTogether,
        serverDate : this.serverDate
      });
    });

  }
}

export default ProductRoamingSettingRoamingAuto;

