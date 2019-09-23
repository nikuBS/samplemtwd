/**
 * 모바일 요금제 > 설정 > 5Gx YT 요금제
 * @author Dong HA Shin
 * @since 2019-09-19
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSetting5gxYt extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00006728', 'NA00006729', 'NA00006730'];

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
      prodInfo = this._getBasDataTxt(prodId),
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
        title: PRODUCT_TYPE_NM.SETTING,
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_10_0177, {}, {}, [prodId])
      .subscribe((settingInfo) => {
        if (settingInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: settingInfo.code,
            msg: settingInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.5gx-yt.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          settingInfo: settingInfo.result,
          prodInfo: prodInfo
        }));
      });
  }

  /**
   * 상품코드에 따라 설정값 노출
   */
  private _getBasDataTxt(prodId: any): any {
    if (prodId === 'NA00006728') {
      return {
        title: '프라임0',
        value1: 'NA00006733',
        value2: 'NA00006736',
        time: '120시간',
        data: '500GB',
      };
    } else if (prodId === 'NA00006729') {
      return {
        title: '스탠다드0',
        value1: 'NA00006732',
        value2: 'NA00006735',
        time: '60시간',
        data: '200GB',
      };
    } else if (prodId === 'NA00006730') {
      return {
        title: '슬림0',
        value1: 'NA00006731',
        value2: 'NA00006734',
        time: '8시간',
        data: '10GB',
      };
    }
  }

}

export default ProductMobileplanSetting5gxYt;
