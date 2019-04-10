/**
 * 모바일 요금제 > 지정번호(절친) 할인 설정; TTL절친10
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-15
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductMobileplanSettingNumberFriend extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00002586'];

  /**
   * 지정번호 목록 변환
   * @param numberInfo - API 응답 값
   */
  private _convNumberInfo(numberInfo: any): any {
    return Object.assign(numberInfo, this._convertNumCoupleList(numberInfo.numCoupleList));
  }

  /**
   * 지정번호 목록 데이터 변환
   * @param numCoupleList - 지정번호 목록
   */
  private _convertNumCoupleList(numCoupleList): any {
    let frBestAsgnNum: any = null;

    numCoupleList.map((item) => {
      if (item.cuplYn === '1') {
        frBestAsgnNum = FormatHelper.conTelFormatWithDash(item.svcNumMask);
      }

      return Object.assign(item, {
        custNmMaskFirstName: FormatHelper.isEmpty(item.custNmMask) ? '-' : item.custNmMask.substr(0, 1),
        custNmMask: FormatHelper.isEmpty(item.custNmMask) ? '-' : item.custNmMask,
        svcNumMask: FormatHelper.conTelFormatWithDash(item.svcNumMask),
        isFriendClass: item.cuplYn === '1' ? 'on' : ''
      });
    });

    return {
      numCoupleList: numCoupleList,
      frBestAsgnNum: frBestAsgnNum
    };
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

    this.apiService.request(API_CMD.BFF_10_0070, {}, {})
      .subscribe((numberInfo) => {
        if (numberInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: numberInfo.code,
            msg: numberInfo.msg
          }));
        }

        res.render('mobileplan/setting/product.mobileplan.setting.number-friend.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          numberInfo: this._convNumberInfo(numberInfo.result),
          isApp: BrowserHelper.isApp(req)
        }));
      });
  }
}

export default ProductMobileplanSettingNumberFriend;
