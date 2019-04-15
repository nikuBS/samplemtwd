/**
 * @file 로그인 시 고객보호 비밀번호 설정되어 있는 경우
 * @author Hakjoon Sim
 * @since 2018-12-04
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class CommonMemberLoginCustPwd extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc target url이 query param으로 설정되어 있지 않은 경우 /main/home 으로 redirect 되도록
   * @param  {Request} req - Request
   * @param  {Response} res - Response
   * @param  {NextFunction} next - next function
   * @param  {any} svcInfo - 고객정보
   * @param  {any} pageInfo - 페이지 정보
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const target = req.query.target || '/main/home';
    res.render('member/common.member.login.cust-pwd.html', { svcInfo: svcInfo, target: target, pageInfo: pageInfo });
  }
}

export default CommonMemberLoginCustPwd;
