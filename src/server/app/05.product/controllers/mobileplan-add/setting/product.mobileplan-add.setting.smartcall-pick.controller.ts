/**
 * 모바일 부가서비스 > 스마트콜Pick 설정
 * @since 2019-09-30
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM, SMART_CALL_PICK } from '../../../../../types/string.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import StringHelper from '../../../../../utils/string.helper';
import ProductHelper from '../../../../../utils/product.helper';

/**
 * @class
 */
class ProductMobileplanAddSettingSmartCallPick extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _prodIdList = ['NA00006399'];

  /**
   * 결합 회선 목록 변환
   * @param combineLIneInfo - API 응답 값
   * @param allSvc - 사용자 전체 회선 정보
   */
  private _convCombineLineInfo(combineLIneInfo: any, allSvc: any): any {
    return this._convertLineList(combineLIneInfo.combinationLineList, allSvc);
  }

  /**
   * 회선 목록 변환
   * @param combinationLineList - 결합 회선 목록
   * @param allSvc - 사용자 전체 회선 정보
   */
  private _convertLineList(combinationLineList: any, allSvc: any): any {

    return combinationLineList.reduce((temp, item) => {
      return Object.assign(temp, item, {
        svcNumMask: StringHelper.maskPhoneNumber( item.svcNum)
      });
    }, {});
  }

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

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0021, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0185, {})
    ]).subscribe(([combineLineInfo, smartCallPickInfo]) => {
      const apiError = this.error.apiError([combineLineInfo, smartCallPickInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      let listSmartPick = smartCallPickInfo.result.listSmartPick;
      let smartCallPick = SMART_CALL_PICK.map(function(e) {
        let row = Object.assign({}, e);
        row.checked = listSmartPick.filter(p => row.value === p.prod_id).length > 0;
        return row;
      });

      res.render('mobileplan-add/setting/product.mobileplan-add.setting.smartcall-pick.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        combineLineInfo: this._convCombineLineInfo(combineLineInfo.result, allSvc),
        vasPackCnt: smartCallPickInfo.result.vas_pack_cnt.replace(/(^0+)/, ''),
        smartCallPick: smartCallPick
      }));
    });
  }
}

export default ProductMobileplanAddSettingSmartCallPick;
