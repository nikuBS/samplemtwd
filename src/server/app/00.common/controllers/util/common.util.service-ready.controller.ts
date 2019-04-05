/**
 * @file common.util.service-ready.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';

class CommonUtilServiceReady extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    // const fromDtm = DateHelper.getShortDateAnd24Time(req.query.fromDtm);
    // const toDtm = DateHelper.getShortDateAnd24Time(req.query.toDtm);
    res.render('util/common.util.service-ready.html', { pageInfo });

  }
}

export default CommonUtilServiceReady;
