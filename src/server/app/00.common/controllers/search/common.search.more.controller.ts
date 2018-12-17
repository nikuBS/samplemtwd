/**
 * FileName: common.search.more.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';

class CommonSearchMore extends TwViewController {
  constructor() {
    super();
  }
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {


        const query =  encodeURI(req.query.keyword) || '';
        const collection = req.query.category || null;
        const pageNum = req.query.page || 1;
        const requestObj = { query , collection , pageNum };

        if (FormatHelper.isEmpty(collection)) {
            return this.error.render(res, {
                svcInfo: svcInfo,
                title: PRODUCT_TYPE_NM.JOIN
            });
        }


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

            res.render('search/common.search.more.html', {
                svcInfo : svcInfo,
                searchInfo : searchResult.result,
                keyword : searchResult.result.query,
                pageNum : pageNum,
                relatedKeyword : relatedKeyword,
                category : decodeURI(collection)
            });
        });


    }
}

export default CommonSearchMore;
