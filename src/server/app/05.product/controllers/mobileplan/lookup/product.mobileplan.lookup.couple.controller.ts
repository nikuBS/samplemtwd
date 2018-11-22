/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.
 *
 */

/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.
 *
 */

/**
 * 모바일 요금제 > Couple 요금제
 * FileName: product.mobileplan.lookup.couple.controller.ts
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

  private readonly _allowedProdIdList = ['NA00002997', 'NA00003513', 'NA00002996', 'NA00003512', 'NA00003514', 'NA00003516', 'NA00002561',
    'NA00002562', 'NA00000010', 'NA00000011', 'NA00000060', 'NA00000061', 'NA00000062', 'NA00000063'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null;
    const data: any = {
      pageInfo: pageInfo,
      svcInfo: svcInfo,
      title: PRODUCT_TYPE_NM.SETTING
    };

    if ( FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1 ) {
      return this.error.render(res, data);
    }

    this.apiService.request(API_CMD.BFF_10_0042, {}, {}, prodId)
      .subscribe((coupleInfo) => {
        if ( coupleInfo.code === API_CODE.CODE_00 ) {
          data.coupleInfo = coupleInfo.result.coupleSetInfoList.length > 0 ? coupleInfo.result.coupleSetInfoList : null;
          if ( !data.coupleInfo ) {
            return this.error.render(res, data);
          }
          res.render('mobileplan/lookup/product.mobileplan.lookup.couple.html', { data });
        } else {
          return this.error.render(res, Object.assign(data, {
            code: coupleInfo.code,
            msg: coupleInfo.msg
          }));
        }
      });
  }
}

export default ProductMobileplanSettingBandYT;
