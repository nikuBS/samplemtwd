/**
 * 검색 결과 더보기
 * @file common.search.more.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import StringHelper from '../../../../utils/string.helper';
import LoggerService from '../../../../services/logger.service';

class CommonSearchMore extends TwViewController {
  private readonly log;

  constructor() {
    super();
    this.log = new LoggerService();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // /common/search/more?keyword=요금제&step=3&category=rate&sort=A
    const query = StringHelper.encodeURIAllCase(req.query.keyword) || null;
    const collection = req.query.category || null;
    const step = req.header('referer') ? req.query.step ? req.query.step : 1 : 1;
    const pageNum = req.query.page || 1;
    // const sort = req.query.arrange || 'R';
    let sort = '';
    try {
      sort = req.query.sort[0] || 'A';
    } catch (e) {
      sort = 'A';
    }

    // 카테고리가 휴대폰, 태블릿, 악세서리일 경우 sort 파라미터를 규약에 맞게 생성
    if ( collection === 'phone' || collection === 'tablet' || collection === 'accessory') {
      // 휴대폰, 태블릿, 악세서리 카테고리는 A(추천순) 정렬 없음
      if ( sort === 'A' ) {
        sort = 'D';
      }

      sort = collection + '-' + sort;
    }

    this.log.info(this, '[common.search.more.controller] ------------------------------------------------------', '');
    this.log.info(this, '[common.search.more.controller] req.query : ', req.query);   // keyword=요금제, step=3, category=rate, sort=A
    this.log.info(this, '[common.search.more.controller] req.query.sort : ', req.query.sort);
    this.log.info(this, '[common.search.more.controller] req.query.page : ', req.query.page);
    this.log.info(this, '[common.search.more.controller] pageNum : ', pageNum);
    this.log.info(this, '[common.search.more.controller] sort : ', sort);
    this.log.info(this, '[common.search.more.controller] ------------------------------------------------------', '');

    let requestObj, researchCd, researchQuery, searchApi;
    if (FormatHelper.isEmpty(req.query.in_keyword)) {
      requestObj = { query, collection, pageNum, sort };
    } else {
      researchCd = 1;
      researchQuery = StringHelper.encodeURIAllCase(req.query.in_keyword) || '';
      requestObj = { query, collection, researchQuery, researchCd, pageNum, sort };
    }

    if (FormatHelper.isEmpty(collection)) {
      return this.error.render(res, {
        pageInfo: pageInfo,
        svcInfo: svcInfo
      });
    }

    if (BrowserHelper.isApp(req)) {
      searchApi = API_CMD.SEARCH_APP;
      if (BrowserHelper.isIos(req)) {
        requestObj.device = 'I';
      } else {
        requestObj.device = 'A';
      }
    } else {
      searchApi = API_CMD.SEARCH_WEB;
    }

    if (!FormatHelper.isEmpty(svcInfo)) {
      requestObj.userId = svcInfo.userId;
    }


    Observable.combineLatest(
      this.apiService.request(searchApi, requestObj, {}),
      this.apiService.request(API_CMD.RELATED_KEYWORD, requestObj, {})
    ).subscribe(([searchResult, relatedKeyword]) => {
      if (searchResult.code !== 0 || relatedKeyword.code !== 0) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code: searchResult.code !== 0 ? searchResult.code : relatedKeyword.code,
          msg: searchResult.code !== 0 ? searchResult.msg : relatedKeyword.msg
        });
      }
      if (FormatHelper.isEmpty(svcInfo) && searchResult.result.totalcount === 1 &&
        collection === 'shortcut' && searchResult.result.search[0].shortcut.data[0].DOCID === 'M000083') {
        searchResult.result.totalcount = 0;
      }
      if (searchResult.result.totalcount === 0) {
        Observable.combineLatest(
          this.apiService.request(API_CMD.BFF_08_0070, {}, {}),
          this.apiService.request(API_CMD.POPULAR_KEYWORD, { range: 'D' }, {})
        ).subscribe(([surveyList, popularKeyword]) => {
          if (surveyList.code !== API_CODE.CODE_00 || popularKeyword.code !== 0) {
            return this.error.render(res, {
              svcInfo: svcInfo,
              pageInfo: pageInfo,
              code: surveyList.code !== API_CODE.CODE_00 ? surveyList.code : popularKeyword.code,
              msg: surveyList.code !== API_CODE.CODE_00 ? surveyList.msg : popularKeyword.msg
            });
          }
          res.render('search/common.search.not-found.html', {
            pageInfo: pageInfo,
            popularKeyword: popularKeyword.result,
            keyword: searchResult.result.query,
            relatedKeyword: relatedKeyword,
            inKeyword: searchResult.result.researchQuery,
            surveyList: surveyList,
            suggestQuery: searchResult.result.suggestQuery,
            step: step,
            from: null
          });
        });
      } else {
        this.log.info(this, '[common.search.more.controller] sort : ', sort);

        res.render('search/common.search.more.html', {
          pageInfo: pageInfo,
          searchInfo: searchResult.result,
          keyword: searchResult.result.query,
          pageNum: pageNum,
          relatedKeyword: relatedKeyword,
          inKeyword: searchResult.result.researchQuery,
          accessQuery: req.query,
          step: step,
          nowUrl: req.originalUrl,
          paramObj: req.query,
          sort: sort || 'A'
        });
        this.log.info(this, '[common.search.more.controller] requestObj.sort : ', requestObj.sort);
      }
    });


  }
}

export default CommonSearchMore;
