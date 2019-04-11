/**
 * 5g 소개페이지
 * @author anklebreaker
 * @since 2019-04-05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonUtil5gIntro extends TwViewController {
  constructor() {
    super();
  }

  /* 접근이 허용되는 세컨뎁스 pathname */
  private readonly _allowed2ndDepth = ['safe-life', 'amazing-life', 'enjoy-life', '5gx-plan'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const page = req.params.page;

    if (!page) {
      return res.render('util/common.util.5g-intro.html', {pageInfo, svcInfo});
    } else if (!this._isAllow(page)) {
      return this.error.render(res, {
        code: '404',
        msg: 'page not found',
        pageInfo: pageInfo,
        svcInfo
      });
    }
    res.render(`util/common.util.5g-intro_${page}.html`, {pageInfo, svcInfo, isAndroid: BrowserHelper.isAndroid(req)});
  }


  /**
   * 허용된 page 인지 체크
   * @param page 세컨뎁스 pathname
   * @return true|false
   */
  _isAllow(page) {
    return this._allowed2ndDepth.indexOf(page) >= 0;
  }
}

export default CommonUtil5gIntro;
