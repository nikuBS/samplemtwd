/**
 * FileName: product.current-setting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.01
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PRODUCT_CURRENT_SETTING } from '../../../mock/server/product.display-ids.mock';

class ProductCurrentSetting extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;
  private _displayId;

  /**
   * @private
   */
  private _getDisplayId(): any {
    let displayId: any = null;
    if (FormatHelper.isEmpty(this._prodId)) {
      return displayId;
    }

    Object.keys(PRODUCT_CURRENT_SETTING).forEach((displayIdKey) => {
      if (PRODUCT_CURRENT_SETTING[displayIdKey].indexOf(this._prodId) !== -1) {
        displayId = displayIdKey;
        return false;
      }
    });

    return displayId;
  }

  /**
   * @param settingInfo
   * @private
   * @todo 각 화면ID 별 셋팅정보 파싱 처리 추가
   */
  private _parseSettingInfo(settingInfo): any {
    switch (this._displayId) {
      case 'MP_02_02_03_04':
        break;
      case 'MP_02_02_03_13':
        break;
      case 'TR_03_01_03':
        break;
      case 'MV_02_02_05':
        break;
    }

    return settingInfo;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId;
    this._displayId = this._getDisplayId();

    if (FormatHelper.isEmpty(this._prodId) || FormatHelper.isEmpty(this._displayId)) {
      return this.error.render(res, {
        title: '설정 조회',
        svcInfo: svcInfo
      });
    }

    this.redisService.getData(this._prodId + 'SSLT')
      .subscribe((redisInfo) => {
        if (FormatHelper.isEmpty(redisInfo) || FormatHelper.isEmpty(API_CMD[redisInfo.apiCode])) {
          return this.error.render(res, {
            title: '설정 조회',
            svcInfo: svcInfo
          });
        }

        this.apiService.request(API_CMD[redisInfo.apiCode], {}, {}, this._prodId)
          .subscribe((settingInfo) => {
            if (settingInfo.code !== API_CODE.CODE_00) {
              return this.error.render(res, {
                code: settingInfo.code,
                msg: settingInfo.msg,
                svcInfo: svcInfo
              });
            }

            res.render('product.current-setting.html', {
              svcInfo: svcInfo,
              displayId: this._displayId,
              currentSettingInfo: this._parseSettingInfo(settingInfo)
            });
          });
      });
  }
}

export default ProductCurrentSetting;
