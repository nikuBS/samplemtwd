/**
 * FileName: common.search.in_result.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';


class CommonSearchMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
      Observable.combineLatest(
          this.apiService.request(API_CMD.TEST_GET_POPULAR_KEYWORD, { range : 'D'}, {}),
          this.apiService.request(API_CMD.BFF_12_0010, { mblOsTypCd : 'X'}, {})
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
              recommendKeyword : recommendKeyword.result
          });
      });
  }
}

export default CommonSearchMain;
