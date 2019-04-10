/**
 * 이용안내 > 이용자피해예방센터 > 최신 이용자 피해예방 주의보 (상세)
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-24
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

/**
 * @class
 */
class CustomerDamageInfoWarningView extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 데이터 변환
   * @param data - API 응답 값
   */
  private _convertData(data): any {
    return Object.assign(data, {
      date: DateHelper.getShortDateWithFormat(data.auditDt, 'YYYY.M.D.')  // 날짜 포맷 처리
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
    const icntsId = req.query.icntsId || '',  // 게시물 키
      renderCommonInfo = {
        title: '최신 이용자 피해예방 주의보',
        svcInfo: svcInfo, // 사용자 정보
        pageInfo: pageInfo  // 페이지 정보
      };

    // 게시물 키가 없이 왔을때 오류 페이지로 연결
    if (FormatHelper.isEmpty(icntsId)) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_08_0064, {}, {}, [icntsId])
      .subscribe((data) => {
        // API 응답 값이 오류 일때 오류 페이지로 연결
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, Object.assign(renderCommonInfo, {
            code: data.code,
            msg: data.msg
          }));
        }

        res.render('damage-info/customer.damage-info.warning.view.html', Object.assign(renderCommonInfo, {
          data: this._convertData(data.result)
        }));
      });
  }
}

export default CustomerDamageInfoWarningView;
