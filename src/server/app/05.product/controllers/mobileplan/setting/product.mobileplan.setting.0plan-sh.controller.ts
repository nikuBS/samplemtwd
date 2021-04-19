/**
 * 모바일 요금제 > 0플랜 슈퍼히어로 설정
 * @author junho kwon (yamanin1@partner.sk.com)
 * @since 2019-5-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSetting0planSh extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006401'];

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

  let render_url = 'mobileplan/setting/product.mobileplan.setting.0plan-sh.html' ;

  if(renderCommonInfo.pageInfo.menuUrl !== '/product/mobileplan/setting/0plan-sh'){
    render_url = 'mobileplan/setting/product.mobileplan.setting.0plan-sh-new.html'
  } 

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0177, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, [this._floNData]),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, [this._pooqNData]),

      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, ['NA00006622']),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, ['NA00006634']),
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, ['NA00007298'])
    ).subscribe(([zeroPlanInfo, Yn_6520, Yn_6577, Yn_6622, Yn_6634, Yn_7298]) => {
      const apiError = this.error.apiError([zeroPlanInfo, Yn_6520, Yn_6577, Yn_6622, Yn_6634, Yn_7298]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
        }));
      }

      res.render(render_url, Object.assign(renderCommonInfo, {
        prodId: prodId,
        zeroPlanInfo: zeroPlanInfo.result,    //현제 요금재 옵션 설정 값
        floNDataUseYn: Yn_6520.result,        // 신규로 변경 되기전 as-is 화면 에서 사용할 타입, to-be 화면 에서는 미사용(202105월 이후 삭제 무방)
        pooqNDataUseYn: Yn_6577.result,       // 신규로 변경 되기전 as-is 화면 에서 사용할 타입, to-be 화면 에서는 미사용(202105월 이후 삭제 무방)
        Yn_6520: Yn_6520.result.isAdditionUse,
        Yn_6577: Yn_6577.result.isAdditionUse, 
        Yn_6622: Yn_6622.result.isAdditionUse,
        Yn_6634: Yn_6634.result.isAdditionUse,
        Yn_7298: Yn_7298.result.isAdditionUse
      }));
    });
  }
}

export default ProductMobileplanSetting0planSh;
