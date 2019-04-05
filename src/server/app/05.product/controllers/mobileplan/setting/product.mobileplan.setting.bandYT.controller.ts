/**
 * MenuName: 모바일 요금제 > Band YT 요금제
 * FileName: product.mobileplan.setting.bandYT.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.11.20
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import FormatHelper from '../../../../../utils/format.helper';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';

class ProductMobileplanSettingBandYT extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005012', 'NA00005013', 'NA00005014', 'NA00005016', 'NA00005017'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.query.prod_id || null;
    const data: any = {
      pageInfo: pageInfo,
      svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
      title: PRODUCT_TYPE_NM.SETTING,
      prodId: prodId
    };

    if ( FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1 ) {
      return this.error.render(res, data);
    }
    // bandYT요금상품 설정조회
    this.apiService.request(API_CMD.BFF_10_0042, {}, {})
      .subscribe((bandytInfo) => {
        if ( bandytInfo.code === API_CODE.CODE_00 ) {
          data.bandyt = bandytInfo.result;
          if ( prodId === 'NA00005017' ) {
            data.nonOption = true;
          }
          res.render('mobileplan/setting/product.mobileplan.setting.bandYT.html', { data });
        } else {
          return this.error.render(res, Object.assign(data, {
            code: bandytInfo.code,
            msg: bandytInfo.msg
          }));
        }
      });
  }
}

export default ProductMobileplanSettingBandYT;
