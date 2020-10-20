/**
 * @file common.tid.route.controller.ts
 * @author Ara Jo(araara.jo@sk.com)
 * @since 2018.07.18
 * @desc Common > TID > 라우팅 처리
 */

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils_en/format.helper';

/**
 * @desc TID 라우터 페이지
 */
class CommonTidRoute extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > TID > 라우팅 처리 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query = req.query;
    const target = req.query.target;

    if ( !FormatHelper.isEmpty(query.error) ) {
      if ( query.error === '3601' ) {
        res.render('tid/en.common.tid.route.html', { pageInfo, target });
      } else if ( query.error === '3602' || query.error === '4503' ) {
        // find-pw, find-id 뒤로가기 버튼 클릭시
        res.render('tid/en.common.tid.route.html', { pageInfo, target: target });
      } else {
        this.error.render(res, {
          code: query.error,
          msg: query.error_description,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    } else {
      res.render('tid/en.common.tid.route.html', { pageInfo, target });
    }
  }
}

export default CommonTidRoute;
