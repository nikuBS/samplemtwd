/**
 * [멤버십 - T멤버십 가입] 관련 처리
 * @author Hyeryoun Lee
 * @since 2019-3-22
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
/**
 * [멤버십 - T멤버십 가입] API호출 및 렌더링
 * @author Hyeryoun Lee
 * @since 2019-3-22
 */
class MembershipJoinComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('join/membership.join.complete.html', { pageInfo });
  }

}

export default MembershipJoinComplete;
