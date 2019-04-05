/**
 * FileName: membership.join.complete.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2019. 3. 22.
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MembershipJoinComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('join/membership.join.complete.html', { pageInfo });
  }

}

export default MembershipJoinComplete;
