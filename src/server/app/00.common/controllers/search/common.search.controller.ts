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
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import MyTDataHotData from '../../../02.myt-data/controllers/usage/myt-data.hotdata.controller';
import BrowserHelper from '../../../../utils/browser.helper';

class CommonSearch extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query =  encodeURI(req.query.keyword) || '';
    const collection = 'all';
    const step = req.header('referer') ? req.query.step ? req.query.step : 1 : 1;
    const from = req.header('referer') ? req.query.from : null;
    let requestObj, researchCd, researchQuery;
    if (FormatHelper.isEmpty(req.query.in_keyword)) {
      requestObj = { query , collection };
    } else {
      researchCd = 1;
      researchQuery = encodeURI(req.query.in_keyword) || null;
      requestObj = { query , collection , researchQuery , researchCd};
    }

    Observable.combineLatest(
      this.apiService.request( BrowserHelper.isApp(req) ? API_CMD.SEARCH_APP : API_CMD.SEARCH_WEB, requestObj, {}),
      this.apiService.request(API_CMD.RELATED_KEYWORD, requestObj, {})
    ).subscribe(([ searchResult, relatedKeyword ]) => {

      if ( searchResult.code !== 0 || relatedKeyword.code !== 0 ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          code : searchResult.code !== 0 ? searchResult.code : relatedKeyword.code,
          msg : searchResult.code !== 0 ? searchResult.msg : relatedKeyword.msg
        });
      }
      if (searchResult.result.search[0].immediate.data.length <= 0 || svcInfo === null) {
        searchResult.result.search[0].immediate.data = [];

      } else {
        searchResult.result.search[0].immediate.data[0].mainData = StringHelper.phoneStringToDash(svcInfo.svcNum);
        switch (Number(searchResult.result.search[0].immediate.data[0].DOCID)) {
          case 2:
            this.apiService.request(API_CMD.BFF_05_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult.result.search[0].immediate.data = [];
                searchResult.result.search[0].immediate.count = 0;
                searchResult.result.totalcount = Number(searchResult.result.totalcount) - 1;
              } else {
                const remainData = new MyTDataHotData().parseCellPhoneUsageData(resultData.result, svcInfo);
                searchResult.result.search[0].immediate.data[0].subData = remainData.gnrlData[0].showRemained;
              }
            });
            break;
          case 3:
            this.apiService.request(API_CMD.BFF_05_0047, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult.result.search[0].immediate.data = [];
                searchResult.result.search[0].immediate.count = 0;
                searchResult.result.totalcount = Number(searchResult.result.totalcount) - 1;
              } else {
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.useAmtTot);
              }
            });
            break;
          case 4:
            this.apiService.request(API_CMD.BFF_05_0079, { payMethod : 'ALL'}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult.result.search[0].immediate.data = [];
                searchResult.result.search[0].immediate.count = 0;
                searchResult.result.totalcount = Number(searchResult.result.totalcount) - 1;
              } else {
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.totalSumPrice);
              }
            });
            break;
          case 5:
            this.apiService.request(API_CMD.BFF_11_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult.result.search[0].immediate.data = [];
                searchResult.result.search[0].immediate.count = 0;
                searchResult.result.totalcount = Number(searchResult.result.totalcount) - 1;
              } else {
                searchResult.result.search[0].immediate.data[0].mainData = resultData.result.mbrGrCd;
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.mbrUsedAmt);
                searchResult.result.search[0].immediate.data[0].barcode = resultData.result.mbrCardNum;
              }
            });
            break;
          default:
            searchResult.result.search[0].immediate.data[0].subData = svcInfo.prodNm;
            break;
        }
      }
      if ( searchResult.result.totalcount === 0 ) {
        Observable.combineLatest(
          this.apiService.request(API_CMD.BFF_08_0070, {}, {}),
          this.apiService.request(API_CMD.POPULAR_KEYWORD, {range : 'D'}, {})
        ).
        subscribe(([surveyList, popularKeyword]) => {
          if (surveyList.code !== API_CODE.CODE_00 || popularKeyword.code !== 0) {
            return this.error.render(res, {
              svcInfo: svcInfo,
              code: surveyList.code !== API_CODE.CODE_00 ? surveyList.code : popularKeyword.code,
              msg: surveyList.code !== API_CODE.CODE_00 ? surveyList.msg : popularKeyword.msg
            });
          }
          res.render('search/common.search.not-found.html', {
            svcInfo : svcInfo,
            popularKeyword : popularKeyword.result,
            keyword : searchResult.result.query,
            relatedKeyword : relatedKeyword,
            inKeyword : searchResult.result.researchQuery,
            surveyList : surveyList.result,
            suggestQuery : searchResult.result.suggestQuery,
            step : step,
            from : from
          });
        });
      } else {
        res.render('search/common.search.html', {
          svcInfo : svcInfo,
          searchInfo : searchResult.result,
          keyword : searchResult.result.query,
          relatedKeyword : relatedKeyword,
          inKeyword : searchResult.result.researchQuery,
          step : step,
          from : from
        });
      }
    });

  }
}

export default CommonSearch;
