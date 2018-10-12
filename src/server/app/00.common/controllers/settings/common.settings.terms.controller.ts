/**
 * FileName: common.settings.terms.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.08
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../common/controllers/tw.view.controller';

export default class CommonSettingsTerms extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    if (req.query.id) {
      // TODO: joon map id with popup type when api is ready

      // Mock
      let title = '';
      let type = '';
      switch (req.query.id) {
        case '1':
          title = '이동전화 이용약관';
          type = 'b-btn';
          break;
        case '2':
          title = 'WCDMA 이용약관';
          type = 'a';
          break;
        case '3':
          title = '재판매 이용약관';
          type = 'c';
          break;
        case '4':
          break;
        default:
          break;
      }
      res.render(`settings/common.settings.term-type-${type}.html`, {
        svcInfo: svcInfo,
        title: title
      });
      return;
    }
    res.render('settings/common.settings.terms.html', { svcInfo: svcInfo });
  }
}
