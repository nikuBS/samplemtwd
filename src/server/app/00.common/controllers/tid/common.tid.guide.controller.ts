/**
 * FileName: common.tid.guide.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.03
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonTidGuide extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.redirect('https://auth-stg.skt-id.co.kr/auth/type/view/guide.do');
  }
}

export default CommonTidGuide;
