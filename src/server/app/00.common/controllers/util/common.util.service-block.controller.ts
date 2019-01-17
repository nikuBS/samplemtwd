/**
 * FileName: common.util.service-block.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.01.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class CommonUtilServiceBlock extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('util/common.util.service-block.html');

  }
}

export default CommonUtilServiceBlock;
