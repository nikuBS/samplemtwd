/**
 * 모바일 부가서비스 > 스마트콜Pick
 * @author 
 * @since 2019-09-30
 */

import TwViewController from '../../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../../utils/format.helper';
import {PRODUCT_TYPE_NM, SMART_CALL_PICK} from '../../../../../types/string.type';
import BrowserHelper from '../../../../../utils/browser.helper';
import {API_CMD} from '../../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import {REDIS_KEY} from '../../../../../types/redis.type';

/**
 * @class
 */
class ProductMobileplanAddJoinSmartCallPick extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 상품코드 */
  private readonly _prodIdList = ['NA00006399'];

  /* 스마트콜Pick 구성 상품코드1 */
  private _subProdIdList1 = ['NA00004343', 'NA00000282', 'NA00000288', 'NA00001509', 'NA00004689', 
                                  'NA00000273', 'NA00005172', 'NA00000278', 'NA00003708', 'NA00001350'];

  /* 스마트콜Pick 구성 상품코드2 */
  private _subProdIdList2 = ['NA00004195'];

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
          prodIds1 = this._subProdIdList1,
          prodIds2 = this._subProdIdList2,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: Object.assign(svcInfo, {svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)}),
        title: PRODUCT_TYPE_NM.JOIN
      };

    if (FormatHelper.isEmpty(prodId) || this._prodIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest([
      this.apiService.request(API_CMD.BFF_10_0007, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0001, {prodExpsTypCd: 'P'}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0183, {}, {}, [prodIds1.join('~')]), /* 스마트콜Pick 멀티 상품코드1 사용여부조회 */
      this.apiService.request(API_CMD.BFF_05_0040, {}, {}, [prodIds2]), /* 스마트콜Pick 개별 상품코드2 사용여부조회 */
      this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId)
    ]).subscribe(([preCheckInfo, basicInfo, multiAdditionInfo1, multiAdditionInfo2, prodRedisInfo]) => {
      const apiError = this.error.apiError([preCheckInfo, basicInfo, multiAdditionInfo1, multiAdditionInfo2, prodRedisInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
          if (apiError.code === 'ICAS4003') { /* BFF_10_0183 호출 시 모든 상품이 사용여부 N인 경우 */
            multiAdditionInfo1 = { result: {} };
            this._subProdIdList1.forEach(e => {
              multiAdditionInfo1.result[e] = 'N';  
            });
          } else {
            return this.error.render(res, Object.assign(renderCommonInfo, {
              code: apiError.code,
              msg: apiError.msg,
              isBackCheck: true
            }));
          }
      }
      const result = multiAdditionInfo1.result,
            usedProd: any[] = [];
      for ( const key in result ) {
        if ( result [key] !== 'N') {
          usedProd.push(key);
        }
      }
      if (multiAdditionInfo2.result.isAdditionUse === 'Y') {
        usedProd.push('NA00004195');
      }
      let smartCallPick = SMART_CALL_PICK.map(function(e) {
        let row = Object.assign({}, e);
        row.checked = usedProd.filter(p => row.value === p).length > 0;
        return row;
      });


      res.render('mobileplan-add/join/product.mobileplan-add.join.smartcall-pick.html', {
        ...renderCommonInfo, prodId,
        isApp: BrowserHelper.isApp(req),
        basicInfo: basicInfo.result,
        prodRedisInfo: prodRedisInfo.result,
        smartCallPick: smartCallPick
      });
    });
  }
}

export default ProductMobileplanAddJoinSmartCallPick;
