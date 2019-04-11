/**
 * 모바일 부가서비스 > 내폰끼리 결합 설정
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-13
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
class ProductMobileplanAddSettingCombineLine extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _allowedProdIdList = ['NA00004778'];

  /**
   * 결합 회선 목록 변환
   * @param combineLIneInfo - API 응답 값
   * @param allSvc - 사용자 전체 회선 정보
   */
  private _convCombineLineInfo(combineLIneInfo: any, allSvc: any): any {
    return Object.assign(combineLIneInfo, {
      svcProdGrpId: combineLIneInfo.combinationLineList[0].svcProdGrpId,
      combinationLineList: this._convertLineList(combineLIneInfo.combinationLineList, allSvc)
    });
  }

  /**
   * 회선 목록 변환
   * @param combinationLineList - 결합 회선 목록
   * @param allSvc - 사용자 전체 회선 정보
   */
  private _convertLineList(combinationLineList: any, allSvc: any): any {
    const nickNameList: any = {};

    if (!FormatHelper.isEmpty(allSvc.m)) {
      allSvc.m.forEach((item) => {
        nickNameList[item.svcMgmtNum] = FormatHelper.isEmpty(item.nickNm) ? null : item.nickNm;
      });
    }

    return combinationLineList.map((item) => {
      return Object.assign(item, {
        svcNumMask: FormatHelper.conTelFormatWithDash(item.svcNumMask),
        nickNm: FormatHelper.isEmpty(nickNameList[item.svcMgmtNum]) ? null : nickNameList[item.svcMgmtNum]
      });
    });
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

    this.apiService.request(API_CMD.BFF_10_0021, {}, {}, [prodId])
      .subscribe((combineLineInfo) => {
        if (combineLineInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: combineLineInfo.code,
            msg: combineLineInfo.msg
          }));
        }

        res.render('mobileplan-add/setting/product.mobileplan-add.setting.combine-line.html', Object.assign(renderCommonInfo, {
          prodId: prodId,
          combineLineInfo: this._convCombineLineInfo(combineLineInfo.result, allSvc),
          isApp: BrowserHelper.isApp(req)
        }));
      });
  }
}

export default ProductMobileplanAddSettingCombineLine;
