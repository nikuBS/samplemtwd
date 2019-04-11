/**
 * 유선 부가서비스 > 설정 (레터링)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-14
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import {API_CMD, API_CODE} from '../../../../../types/api-command.type';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';
import FormatHelper from '../../../../../utils/format.helper';

/**
 * @class
 */
class ProductWireplanSettingLettering extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NP00000419', 'NP00000420', 'NP00000421'];

  /**
   * 버튼 목록 예외처리
   * @param currentAdditionsInfo - API 응답 값
   */
  private _getBtnData(currentAdditionsInfo: any): any {
    if (FormatHelper.isEmpty(currentAdditionsInfo.btnData)) {
      return null;
    }

    return currentAdditionsInfo.btnData;
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

          res.render('wireplan/setting/product.wireplan.setting.lettering.html', Object.assign(renderCommonInfo, {
            prodId: prodId,
            settingInfo: settingInfo.result,
            btnData: this._getBtnData(preInfo.result)
          }));
        });
      });
  }
}

export default ProductWireplanSettingLettering;
