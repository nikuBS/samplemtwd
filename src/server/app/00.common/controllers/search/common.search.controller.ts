/**
 * FileName: common.search.controller.ts
 * Author: Hyunkuk Lee ( max5500@pineone.com )
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {REDIS_PRODUCT_INFO} from '../../../../types/redis.type';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

class CommonSearch extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {


      const query =  encodeURI(req.query.keyword) || '';
      const collection = 'all';
      const requestObj = { query , collection };



      Observable.combineLatest(
          this.apiService.request(API_CMD.TEST_SEARCH, requestObj, {}),
          this.apiService.request(API_CMD.TEST_RELATED_KEYWORD, requestObj, {})
      ).subscribe(([ searchResult, relatedKeyword ]) => {
          if ((searchResult.code !== 0)) {
              return this.error.render(res, {
                  svcInfo: svcInfo,
                  title: PRODUCT_TYPE_NM.JOIN
              });
          }

          res.render('search/common.search.html', {
              svcInfo : svcInfo,
              searchInfo : searchResult.result,
              keyword : searchResult.result.query,
              relatedKeyword : relatedKeyword
          });
      });


  }
}

export default CommonSearch;
