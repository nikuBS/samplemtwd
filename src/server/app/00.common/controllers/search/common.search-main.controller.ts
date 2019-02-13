/**
 * FileName: common.search.in-result.controller.ts
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
      this.apiService.request(API_CMD.BFF_08_0068, { mblOsTypCd : nowOsType }, {}),
      this.apiService.request(API_CMD.BFF_08_0069, { mblOsTypCd : nowOsType }, {})
    ).subscribe(([ popularKeyword, recommendKeyword , smartKeyword]) => {
      if (popularKeyword.code !== 0 || recommendKeyword.code !== API_CODE.CODE_00 || smartKeyword.code !== API_CODE.CODE_00 ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          code: popularKeyword.code !== 0 ? popularKeyword.code : recommendKeyword.code !== API_CODE.CODE_00 ? recommendKeyword.code : smartKeyword.code,
          msg: popularKeyword.code !== 0 ? popularKeyword.msg : recommendKeyword.code !== API_CODE.CODE_00 ? recommendKeyword.msg : smartKeyword.msg
        });
      }
      res.render('search/common.search-main.html', {
        svcInfo : svcInfo,
        popularKeyword : popularKeyword,
        recommendKeyword : recommendKeyword.result,
        smartKeyword : smartKeyword.result,
        step : step
      });
    });
  }
}

export default CommonSearchMain;
