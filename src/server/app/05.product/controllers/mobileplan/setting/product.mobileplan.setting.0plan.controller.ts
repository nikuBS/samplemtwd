/**
 * 모바일 요금제 > 0플랜 라지 설정
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';
import DateHelper from '../../../../../utils/date.helper';

/**
 * @class
 */
class ProductMobileplanSetting0plan extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006157'];

  /* 사용여부 확인 필요 상품코드 */
  private _floNData = 'NA00006520';
  private _pooqNData = 'NA00006577';

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.SETTING
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0177, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, [this._floNData]),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, [this._pooqNData]),
      this.apiService.request(API_CMD.BFF_01_0067, {})
      ).subscribe(([zeroPlanInfo, floNDataUseYn, pooqNDataUseYn, birthdayInfo]) => {
        const apiError = this.error.apiError([zeroPlanInfo, floNDataUseYn, pooqNDataUseYn]);
  
        if (!FormatHelper.isEmpty(apiError)) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: apiError.code,
            msg: apiError.msg,
          }));
        }
  
        res.render('mobileplan/setting/product.mobileplan.setting.0plan.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          zeroPlanInfo: zeroPlanInfo.result,
          floNDataUseYn: floNDataUseYn.result,
          pooqNDataUseYn: pooqNDataUseYn.result,
          isUnderAge19: DateHelper.isUnderAge(19, birthdayInfo.result.birthday)
        }));
      });
  }
}

export default ProductMobileplanSetting0plan;
