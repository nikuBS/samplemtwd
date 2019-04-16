/**
 * @file common.util.service-block.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.01.17
 * @desc Common > Util > 화면 차단
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import DateHelper from '../../../../utils/date.helper';

/**
 * @desc 화면 차단 초기화를 위한 class
 */
class CommonUtilServiceBlock extends TwViewController {
  constructor() {
    super();
  }

  /**
   * Common > Util > 화면 차단 렌더 함수
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const fromDtm = DateHelper.getShortDateAnd24Time(req.query.fromDtm);
    const toDtm = DateHelper.getShortDateAnd24Time(req.query.toDtm);
    res.render('util/common.util.service-block.html', { fromDtm, toDtm, pageInfo });

  }
}

export default CommonUtilServiceBlock;
