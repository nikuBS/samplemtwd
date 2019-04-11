/**
 * 모바일 부가서비스 > 시그니처 워치
 * @author Jihun Yang
 * @since 2018-11-15
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../../utils/format.helper';
import BrowserHelper from '../../../../../utils/browser.helper';
import ProductHelper from '../../../../../utils/product.helper';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_TYPE_NM } from '../../../../../types/string.type';

/**
 * @class
 */
class ProductMobileplanAddJoinSignatureLine extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private _prodIdList = ['NA00005381'];

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
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_05_0133, {}).subscribe((currentCombineInfo) => {
      if (currentCombineInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: currentCombineInfo.code,
          msg: currentCombineInfo.msg
        }));
      }

      const currentCombineList = currentCombineInfo.result.combinationMemberList.map((item) => {
        return item.prodId;
      });

      if (currentCombineList.indexOf(prodId) !== -1) {
        return this.error.render(res, renderCommonInfo);
      }

      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
        this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, [prodId]),
        this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId])
      ).subscribe(([ preCheckInfo, basicInfo, joinTermInfo ]) => {
        const apiError = this.error.apiError([preCheckInfo, basicInfo, joinTermInfo]);

        if (!FormatHelper.isEmpty(apiError)) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: apiError.code,
            msg: apiError.msg,
            isBackCheck: true
          }));
        }

        res.render('mobileplan-add/join/product.mobileplan-add.join.signature-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          isApp: BrowserHelper.isApp(req),
          basicInfo: basicInfo.result,
          joinTermInfo: ProductHelper.convAdditionsJoinTermInfo(joinTermInfo.result)
        }));
      });
    });
  }
}

export default ProductMobileplanAddJoinSignatureLine;
