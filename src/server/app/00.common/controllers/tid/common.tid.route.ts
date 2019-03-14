/**
 * FileName: common.tid.route.controller.ts
 * Author: Ara Jo(araara.jo@sk.com)
 * Date: 2018.07.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../../utils/format.helper';

class CommonTidRoute extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query = req.query;
    const target = req.query.target;

    if ( !FormatHelper.isEmpty(query.error) ) {
      if ( query.error === '3601' ) {
        res.render('tid/common.tid.route.html', { pageInfo, target });
      } else if ( query.error === '3602' || query.error === '4503' ) {
        // find-pw, find-id 뒤로가기 버튼 클릭시
        res.render('tid/common.tid.route.html', { pageInfo, target: '/common/member/tid-pwd' });
      } else {
        this.error.render(res, {
          code: query.error,
          msg: query.error_description,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    } else {
      res.render('tid/common.tid.route.html', { pageInfo, target });
    }
  }
}

export default CommonTidRoute;
