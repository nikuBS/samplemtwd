/**
 * 유선 부가서비스 > 설정 (가입정보 입력)
 * FileName: product.wireplan.setting.basic-info.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import ProductHelper from '../../../../../utils/product.helper';
import FormatHelper from '../../../../../utils/format.helper';
import {render} from 'ejs';

class ProductWireplanSettingBasicInfo extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NI00000342', 'NI00000266', 'NI00000333', 'NI00000264',
    'NI00000435', 'NI00000437', 'NI00000436'];

  /**
   * @param currentAdditionsInfo
   * @private
   */
  private _getBtnData(currentAdditionsInfo: any): any {
    if (FormatHelper.isEmpty(currentAdditionsInfo.btnData)) {
      return null;
    }

    return currentAdditionsInfo.btnData;
  }

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

    this.apiService.request(API_CMD.BFF_10_0165, {}, {}, [prodId])
      .subscribe((preInfo) => {
        if (preInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: preInfo.code,
            msg: preInfo.msg
          }));
        }

        this.apiService.request(API_CMD.BFF_10_0115, {
          scrbTermClCd: '02',
          addSvcAddYn: preInfo.result.btnData.addSvcAddYn,
          cntcPlcInfoRgstYn: preInfo.result.btnData.cntcPlcInfoRgstYn,
          addInfoRelScrnId: preInfo.result.btnData.addInfoRelScrnId,
          serNum: preInfo.result.btnData.serNum
        }, {}, [prodId]).subscribe((settingInfo) => {
          if (settingInfo.code !== API_CODE.CODE_00) {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              code: settingInfo.code,
              msg: settingInfo.msg
            }));
          }

          res.render('wireplan/setting/product.wireplan.setting.basic-info.html', Object.assign(renderCommonInfo, {
            prodId: prodId,
            settingInfo: settingInfo.result,
            btnData: this._getBtnData(preInfo.result)
          }));
        });
      });
  }
}

export default ProductWireplanSettingBasicInfo;
