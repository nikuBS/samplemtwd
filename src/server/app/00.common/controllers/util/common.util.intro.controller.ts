/**
 * @file common.util.intro.controller.ts
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonUtilIntro extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    res.render('util/common.util.intro.html', {pageInfo, isApp: BrowserHelper.isApp(req)});
  }
}

export default CommonUtilIntro;
