/**
 * @file main.welcome.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.09.06
 * @desc 메인 > 홈
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

/**
 * @desc 환영페이지 class
 */
class Welcome extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 메인화면-MY 렌더 함수
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @param {object} svcInfo
   * @param {object} allSvc
   * @param {object} childInfo
   * @param {object} pageInfo
   * @return {void}
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    if (svcInfo) { // 로그인 
        const tLink = ['/main/home', '/myt-join/submain', '/myt-data/submain', '/customer'];
        const myfedd = '/new/my-feed';
        
    } else { // 비로그인 

    }

    res.render(`main.welcome.html`, {
      title: '환영페이지',
      desc: 'T월드 페이지를 환영 합니다.'
    });
  }
}

export default Welcome;
