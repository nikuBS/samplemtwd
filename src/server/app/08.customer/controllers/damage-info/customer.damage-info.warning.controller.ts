/**
 * 이용안내 > 이용자피해예방센터 > 최신 이용자 피해예방 주의보
 * @file customer.damage-info.warning.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';

class CustomerDamageInfoWarning extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 목록 변환
   * @param list
   * @private
   */
  private _convertList(list): any {
    return list.map(item => {
      return Object.assign(item, {
        date: DateHelper.getShortDateWithFormat(item.auditDt, 'YYYY.M.D.')  // 날짜 포맷
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo: any = {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo  // 페이지 정보
    };

    // 주요 및 일반 목록을 각각 가져와야 한다.
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00001' }), // 주요 목록 요청
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00002' })  // 일반 목록 요청
    ).subscribe(([warningTopInfo, warningNormalInfo]) => {
      const apiError = this.error.apiError([warningTopInfo, warningNormalInfo]);  // API 응답 결과 확인

      // 오류가 있으면 오류 페이지로 연결
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('damage-info/customer.damage-info.warning.html', Object.assign(renderCommonInfo, {
        importList: this._convertList(warningTopInfo.result.content), // 중요 목록
        normalList: this._convertList(warningNormalInfo.result.content),  // 일반 목록
        totalPages: warningNormalInfo.result.totalPages // 전체 페이지 수; client 에서 더보기 처리시 활용하기 위한 값
      }));
    });
  }
}

export default CustomerDamageInfoWarning;
