/**
 * FileName: common.util.service-block.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.01.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';

class CommonUtilServiceBlock extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const fromDtm = DateHelper.getShortDateAnd24Time(req.query.fromDtm);
    const toDtm = DateHelper.getShortDateAnd24Time(req.query.toDtm);
    res.render('util/common.util.service-block.html', { fromDtm, toDtm, pageInfo });

  }
}

export default CommonUtilServiceBlock;
