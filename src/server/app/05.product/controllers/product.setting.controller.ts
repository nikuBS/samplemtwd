/**
 * FileName: product.setting.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.11
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { PRODUCT_SETTING } from '../../../mock/server/product.display-ids.mock';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { PROD_CTG_CD_CODE } from '../../../types/bff.type';
import { Observable } from 'rxjs/Observable';

class ProductSetting extends TwViewController {
  constructor() {
    super();
  }

  private _prodId;
  private _displayId;
  private _displayGroup;
  private _redirectProdId;
  private _redirectProdIdList = {
    NA00004198: ['NA00004048', 'NA00004049'],
    NA00004188: ['NA00004046'],
    NA00004196: ['NA00004047']
  };

  private _planProdList = {
    NA00005959: 'BFF_10_0013'
  };

  /**
   * @private
   */
  private _isRedirect(): any {
    let result = false;

    Object.keys(this._redirectProdIdList).forEach((key) => {
      if (this._redirectProdIdList[key].indexOf(this._prodId) !== -1) {
        this._redirectProdId = key;
        result = true;

        return false;
      }
    });

    return result;
  }

  /**
   * @private
   */
  private _getDisplayId(): any {
    let displayId: any = null;

    Object.keys(PRODUCT_SETTING).forEach((key) => {
      if (PRODUCT_SETTING[key].indexOf(this._prodId) !== -1) {
        displayId = key;
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
      case 'MP_02_02_03_14':
        break;
      case 'MP_02_02_03_01':
        break;
      case 'MP_02_02_03_03':
        break;
      case 'MP_02_02_03_05':
        break;
      case 'MP_02_02_03_06':
        break;
      case 'MP_02_02_03_07':
        break;
      case 'MP_02_02_03_08':
        break;
      case 'MP_02_02_03_09':
        break;
      case 'MP_02_02_03_10':
        break;
      case 'MP_02_02_03_11':
        break;
      case 'MP_02_02_03_12':
        break;
      case 'TR_03_01_01':
        break;
      case 'TR_03_01_02_00':
        break;
      case 'TR_03_01_02_01':
        break;
      case 'TR_03_01_02_02':
        break;
      case 'TR_03_01_02_03':
        break;
      case 'TR_03_01_02_04':
        break;
      case 'MV_01_02_02_06':
        break;
      case 'MV_02_02_01':
        break;
      case 'MV_02_02_02':
        break;
      case 'MV_02_02_03':
        break;
      case 'MV_02_02_04':
        break;
    }

    return settingInfo;
  }

  /**
   * @param ctgCd
   * @private
   */
  private _getDisplayGroup(ctgCd): any {
    return PROD_CTG_CD_CODE[ctgCd];
  }

  /**
   * @private
   */
  private _getApiCode(): Observable<any> {
    if (!FormatHelper.isEmpty(this._planProdList[this._prodId])) {
      return Observable.of({ apiCode: this._planProdList[this._prodId] });
    }

    return this.redisService.getData(this._prodId + 'SL');
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this._prodId = req.params.prodId || '';

    if (FormatHelper.isEmpty(this._prodId)) {
      return this.error.render(res, {
        title: '상품 설정',
        svcInfo: svcInfo
      });
    }

    if (this._isRedirect()) {
      return res.redirect('/product/' + this._redirectProdId);
    }

    this.apiService.request(API_CMD.BFF_10_0001, {}, {}, this._prodId)
      .subscribe((basicInfo) => {
        this._displayId = this._getDisplayId();
        this._displayGroup = this._getDisplayGroup(basicInfo.result.ctgCd);

        if (FormatHelper.isEmpty(this._displayId)) {
          return this.error.render(res, {
            title: '상품 설정',
            svcInfo: svcInfo
          });
        }

        this._getApiCode().subscribe((ApiInfo) => {
          if (FormatHelper.isEmpty(ApiInfo)) {
            this.logger.info(this, '[EMPTY API INFO] API CODE IS EMPTY');
            return this.error.render(res, {
              title: '상품 설정',
              svcInfo: svcInfo
            });
          }

          this.apiService.request(API_CMD[ApiInfo.apiCode], {}, {}, this._prodId)
            .subscribe((settingInfo) => {
              if (settingInfo.code !== API_CODE.CODE_00) {
                return this.error.render(res, {
                  code: settingInfo.code,
                  msg: settingInfo.msg,
                  title: '상품 설정',
                  svcInfo: svcInfo
                });
              }

              res.render('product.setting.html', {
                svcInfo: svcInfo,
                prodId: this._prodId,
                displayId: this._displayId,
                displayGroup: this._displayGroup,
                settingInfo: this._parseSettingInfo(settingInfo.result)
              });
            });
          });
      });
  }
}

export default ProductSetting;
