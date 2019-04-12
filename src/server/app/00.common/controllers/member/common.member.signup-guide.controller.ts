/**
 * @file 가입안내 화면 전송
 * @author Hakjoon Sim
 * @since 2018-07-02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberSignupGuide extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/common.member.signup-guide.html', { svcInfo: svcInfo, pageInfo: pageInfo });
  }
}

export default CommonMemberSignupGuide;
