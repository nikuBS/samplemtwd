/**
 * @file common.tid.guide.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import EnvHelper from '../../../../utils/env.helper';

class CommonTidGuide extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const tidServer = EnvHelper.getEnvironment('TID_SERVER');
    if (process.env.NODE_ENV === 'prd') {
      res.redirect(tidServer + '/auth/type/view/guide.do');
    } else {
      res.redirect(tidServer + '/auth/type/view/guide.do');
    }
  }
}

export default CommonTidGuide;
