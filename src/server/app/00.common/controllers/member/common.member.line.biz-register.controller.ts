/**
 * FileName: commmon.line.cop-register.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.28
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
class CommonMemberLineBizRegister extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

  }
}

export default CommonMemberLineBizRegister;