/**
* @file common.member.manage.controller.ts
* @author 김기남 (skt.P161322@partner.sk.com)
* @since 2020.09.18
* Summary: 영문 회원정보
*/

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

/**
 * @class
 * @desc 회원정보관리
 */
class CommonMemberManage extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('member/en.common.member.manage.html', { svcInfo, pageInfo });
  }
}

export default CommonMemberManage;
