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
    if ( !FormatHelper.isEmpty(query.error) ) {
      res.send(query.error_description);
    } else {
      res.render('tid/common.tid.route.html', { pageInfo });
    }
  }
}

export default CommonTidRoute;
