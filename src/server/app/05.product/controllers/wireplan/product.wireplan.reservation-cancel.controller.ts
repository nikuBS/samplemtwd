/**
 * 예약 취소 - 유선 부가서비스
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-12
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';

/**
 * @class
 */
class ProductWireplanReservationCancel extends TwViewController {
  constructor() {
    super();
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
    const prodId = req.query.prod_id || null, // 상품코드
      renderCommonInfo = {
        pageInfo: pageInfo, // 페이지 정보
        svcInfo: svcInfo  // 사용자 정보
      };

    // 상품코드가 빈값일때 오류 처리
    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0111, { joinTermCd: '04' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0166, { joinTermCd: '04' }, {}, [prodId])
    ).subscribe(([joinTermInfo, currentAdditionsInfo]) => {
      // API 응답
      const apiError = this.error.apiError([joinTermInfo, currentAdditionsInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg,
          isBackCheck: true
        }));
      }

      res.render('wireplan/product.wireplan.reservation-cancel', Object.assign(renderCommonInfo, {
        joinTermInfo: ProductHelper.convWireplanJoinTermInfo(joinTermInfo.result, false),
        currentAdditionsInfo: currentAdditionsInfo.result
      }));
    });
  }
}

export default ProductWireplanReservationCancel;
