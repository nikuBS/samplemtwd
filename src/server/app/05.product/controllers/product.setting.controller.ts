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
import { PROD_CTG_CD_CODE, PROD_TTAB_BASIC_DATA_PLUS } from '../../../types/bff.type';
import { Observable } from 'rxjs/Observable';
import BrowserHelper from '../../../utils/browser.helper';

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
        settingInfo = Object.assign(settingInfo, {
          basicDataPlus: PROD_TTAB_BASIC_DATA_PLUS[this._prodId]
        });
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
        settingInfo = Object.assign(settingInfo, {
          combinationLineList: this._convertSvcNumMask(settingInfo.combinationLineList)
        });
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
   * @param combinationLineList
   * @private
   */
  private _convertSvcNumMask(combinationLineList): any {
    return combinationLineList.map((item) => {
      return Object.assign(item, {
        svcNumMask: FormatHelper.conTelFormatWithDash(item.svcNumMask)
      });
    });
  }

  /**
   * @param ctgCd
   * @private
   */
  private _getDisplayGroup(ctgCd): any {
    return PROD_CTG_CD_CODE[ctgCd];
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvcInfo: any, layerType: string) {
    this._prodId = req.params.prodId || '';
    this._displayId = null;
    this._displayGroup = null;
    this._redirectProdId = null;

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
        if (basicInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            code: basicInfo.code,
            msg: basicInfo.msg,
            svcInfo: svcInfo,
            title: '상품 설정'
          });
        }

        this._displayId = this._getDisplayId();
        this._displayGroup = this._getDisplayGroup(basicInfo.result.ctgCd);
        this.logger.info(this, '[DISPLAY ID] ' + this._displayId);

        if (FormatHelper.isEmpty(this._displayId)) {
          return this.error.render(res, {
            title: '상품 설정',
            svcInfo: svcInfo
          });
        }

        Observable.combineLatest(
          this.redisService.getData('ProductLedger:' + this._prodId),
          this.redisService.getData('ProductChangeApi:' + this._prodId + 'SL'),
          this.redisService.getData('ProductChangeApi:' + this._prodId + 'SS'),
          this.apiService.request(API_CMD.BFF_10_9001, {}, {}, this._prodId, 'TM')
        ).subscribe(([prodRedisInfo, selectApiInfo, updateApiInfo, settingAuthApiInfo]) => {

          // @todo BFF_10_9001 API 배포 이후 활성화
          // if (settingAuthApiInfo.code !== API_CODE.CODE_00) {
          //   return this.error.render(res, {
          //     code: settingAuthApiInfo.code,
          //     msg: settingAuthApiInfo.msg,
          //     svcInfo: svcInfo,
          //     title: '상품 설정'
          //   });
          // }

          let bffApiCode: any = null;
          if (!FormatHelper.isEmpty(selectApiInfo)) {
            bffApiCode = selectApiInfo.bffApiCode;
          }

          // @todo dummy data
          if (this._prodId === 'NA00004778') {
            bffApiCode = 'BFF_10_0021';
          }

          if (FormatHelper.isEmpty(bffApiCode)) {
            return this.error.render(res, {
              svcInfo: svcInfo,
              title: '상품 설정'
            });
          }

          this.logger.info(this, '[PRODUCT_SETTING_API_CODE] : ' + bffApiCode);
          this.apiService.request(API_CMD[bffApiCode], {}, {}, this._prodId)
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
                prodNm: FormatHelper.isEmpty(prodRedisInfo) ? '' : prodRedisInfo.summary.prodNm,
                prodId: this._prodId,
                displayId: this._displayId,
                displayGroup: this._displayGroup,
                settingInfo: this._parseSettingInfo(settingInfo.result),
                updateApiCode: FormatHelper.isEmpty(updateApiInfo) ? '' : updateApiInfo.bffApiCode,
                isApp: BrowserHelper.isApp(req)
              });
            });
          });
      });
  }
}

export default ProductSetting;
