/**
 * 검색 메인 화면
 * @file common.search.in-result.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
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
      this.apiService.request(API_CMD.BFF_08_0068, { mblOsTypCd : nowOsType }, {}),
      this.apiService.request(API_CMD.BFF_08_0069, { mblOsTypCd : nowOsType }, {})
    ).subscribe(([ popularKeyword, recommendKeyword , smartKeyword]) => {
      if ( popularKeyword.code !== 0 ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code: popularKeyword.code,
          msg: popularKeyword.msg
        });
      }

      res.render('search/common.search-main.html', {
        pageInfo: pageInfo,
        popularKeyword : popularKeyword,
        recommendKeyword : recommendKeyword,
        smartKeyword : smartKeyword,
        step : step
      });
    });
  }
}

export default CommonSearchMain;
