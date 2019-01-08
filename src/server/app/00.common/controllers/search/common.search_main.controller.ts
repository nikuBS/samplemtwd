/**
 * FileName: common.search.in_result.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import BrowserHelper from '../../../../utils/browser.helper';


class CommonSearchMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
      const nowOsType = BrowserHelper.isApp(req) ? BrowserHelper.isAndroid(req) ? 'A' : 'I' : 'X';
      const step = req.query.step || 1;
      Observable.combineLatest(
          this.apiService.request(API_CMD.POPULAR_KEYWORD, { range : 'D'}, {}),
          this.apiService.request(API_CMD.BFF_12_0010, { mblOsTypCd : nowOsType }, {})
      ).subscribe(([ popularKeyword, recommendKeyword ]) => {
          // if (popularKeyword.code !== API_CODE.CODE_00) {
          //     popularKeyword.result = [];
          // }
          // if (recommendKeyword.code !== API_CODE.CODE_00) {
          //     recommendKeyword.result = [];
          // }
          res.render('search/common.search_main.html', {
              svcInfo : svcInfo,
              popularKeyword : popularKeyword,
              recommendKeyword : recommendKeyword.result,
              step : step
          });
      });
  }
}

export default CommonSearchMain;
