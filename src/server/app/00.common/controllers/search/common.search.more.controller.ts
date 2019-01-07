/**
 * FileName: common.search.more.controller.ts
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {PRODUCT_TYPE_NM} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonSearchMore extends TwViewController {
  constructor() {
    super();
  }
    render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

        const query =  encodeURI(req.query.keyword) || '';
        const collection = req.query.category || null;
        const pageNum = req.query.page || 1;
        const sort = req.query.arrange || 'R';
        let requestObj, researchCd, researchQuery;
        if (FormatHelper.isEmpty(req.query.in_keyword)) {
            requestObj = { query , collection , pageNum , sort };
        } else {
            researchCd = 1;
            researchQuery = encodeURI(req.query.in_keyword) || '';
            requestObj = { query , collection , researchQuery , researchCd , pageNum , sort };
        }

        if (FormatHelper.isEmpty(collection)) {
            return this.error.render(res, {
                svcInfo: svcInfo,
                title: PRODUCT_TYPE_NM.JOIN
            });
        }


        Observable.combineLatest(
            this.apiService.request( BrowserHelper.isApp(req) ? API_CMD.SEARCH_APP : API_CMD.SEARCH_WEB, requestObj, {}),
            this.apiService.request(API_CMD.RELATED_KEYWORD, requestObj, {})
        ).subscribe(([ searchResult, relatedKeyword ]) => {
            if ((searchResult.code !== 0)) {
                return this.error.render(res, {
                    svcInfo: svcInfo,
                    title: PRODUCT_TYPE_NM.JOIN
                });
            }
            if ( searchResult.result.totalcount === 0 ) {
                Observable.combineLatest(
                    this.apiService.request(API_CMD.BFF_08_0069, {srchId : '52'}, {}),
                    this.apiService.request(API_CMD.POPULAR_KEYWORD, {range : 'D'}, {})
                ).
                subscribe(([surveyList, popularKeyword]) => {
                    if (surveyList.code !== API_CODE.CODE_00) {
                        return this.error.render(res, {
                            svcInfo: svcInfo,
                            code: surveyList.code,
                            msg: surveyList.msg,
                        });
                    }
                    res.render('search/common.search.not_found.html', {
                        svcInfo : svcInfo,
                        popularKeyword : popularKeyword.result,
                        keyword : searchResult.result.query,
                        relatedKeyword : relatedKeyword,
                        inKeyword : searchResult.result.researchQuery,
                        surveyList : surveyList.result,
                        suggestQuery : searchResult.result.suggestQuery
                    });
                });
            } else {
                res.render('search/common.search.more.html', {
                    svcInfo : svcInfo,
                    searchInfo : searchResult.result,
                    keyword : searchResult.result.query,
                    pageNum : pageNum,
                    relatedKeyword : relatedKeyword,
                    inKeyword : searchResult.result.researchQuery,
                    accessQuery : req.query
                });
            }
        });


    }
}

export default CommonSearchMore;
