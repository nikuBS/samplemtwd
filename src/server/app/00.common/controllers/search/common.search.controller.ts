/**
 * FileName: common.search.controller.ts
 * Author: Hyunkuk Lee ( max5500@pineone.com )
 * Date: 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import MyTDataHotData from '../../../02.myt-data/controllers/usage/myt-data.hotdata.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import {delay, mergeMap} from 'rxjs/operators';
import {MYT_FARE_HOTBILL_TITLE} from '../../../../types/title.type';

class CommonSearch extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query =  StringHelper.encodeURIAllCase(req.query.keyword);
    const collection = 'all';
    const step = req.header('referer') ? req.query.step ? req.query.step : 1 : 1;
    const from = req.header('referer') ? req.query.from : null;
    let requestObj, researchCd, researchQuery, searchApi ;
    function showSearchResult(searchResult, relatedKeyword , thisObj) {
      if ( searchResult.result.totalcount === 0 ) {
        Observable.combineLatest(
          thisObj.apiService.request(API_CMD.BFF_08_0070, {}, {}),
          thisObj.apiService.request(API_CMD.POPULAR_KEYWORD, {range : 'D'}, {})
        ).subscribe((resultObj) => {
          if (resultObj[0].code !== API_CODE.CODE_00 || resultObj[1].code !== 0) {
            return thisObj.error.render(res, {
              svcInfo: svcInfo,
              pageInfo: pageInfo,
              code: resultObj[0].code !== API_CODE.CODE_00 ? resultObj[0].code : resultObj[1].code,
              msg: resultObj[0].code !== API_CODE.CODE_00 ? resultObj[0].msg : resultObj[1].msg
            });
          }
          res.render('search/common.search.not-found.html', {
            svcInfo : svcInfo,
            pageInfo: pageInfo,
            popularKeyword : resultObj[1].result,
            keyword : searchResult.result.query,
            relatedKeyword : relatedKeyword,
            inKeyword : searchResult.result.researchQuery,
            surveyList : resultObj[0],
            suggestQuery : searchResult.result.suggestQuery,
            step : step,
            from : from
          });
        });

      } else {
        res.render('search/common.search.html', {
          svcInfo : svcInfo,
          pageInfo: pageInfo,
          searchInfo : searchResult.result,
          keyword : searchResult.result.query,
          relatedKeyword : relatedKeyword,
          inKeyword : searchResult.result.researchQuery,
          step : step,
          from : from,
          nowUrl : req.originalUrl
        });
      }
    }
    function removeImmediateData(searchResult) {
      searchResult.result.search[0].immediate.data = [];
      searchResult.result.search[0].immediate.count = 0;
      searchResult.result.totalcount = Number(searchResult.result.totalcount) - 1;
      return searchResult;
    }
    if (FormatHelper.isEmpty(req.query.in_keyword)) {
      requestObj = { query , collection };
    } else {
      researchCd = 1;
      researchQuery = StringHelper.encodeURIAllCase(req.query.in_keyword) || null;
      requestObj = { query , collection , researchQuery , researchCd};
    }

    if (BrowserHelper.isApp(req)) {
      searchApi = API_CMD.SEARCH_APP;
      if ( BrowserHelper.isIos(req) ) {
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
      this.apiService.request( searchApi , requestObj, {}),
      this.apiService.request(API_CMD.RELATED_KEYWORD, requestObj, {})
    ).subscribe(([ searchResult, relatedKeyword ]) => {

      if ( searchResult.code !== 0 || relatedKeyword.code !== 0 ) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code : searchResult.code !== 0 ? searchResult.code : relatedKeyword.code,
          msg : searchResult.code !== 0 ? searchResult.msg : relatedKeyword.msg
        });
      }
      if (FormatHelper.isEmpty(svcInfo) && searchResult.result.totalcount === 1 && searchResult.result.search[2].shortcut.data.length && searchResult.result.search[2].shortcut.data[0].DOCID === 'M000083') {
        searchResult.result.totalcount = 0;
      }
      if (searchResult.result.search[0].immediate.data.length <= 0 || svcInfo === null) {
        if (!FormatHelper.isEmpty(searchResult.result.search[0].immediate.data)) {
          searchResult = removeImmediateData(searchResult);
        }
        showSearchResult(searchResult, relatedKeyword , this);
      } else {
        searchResult.result.search[0].immediate.data[0].mainData = StringHelper.phoneStringToDash(svcInfo.svcNum);
        switch (Number(searchResult.result.search[0].immediate.data[0].DOCID)) {
          case 2:
            this.apiService.request(API_CMD.BFF_05_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                if (resultData.result.gnrlData[0].prodId !== svcInfo.prodId) {
                  for (let i = 0; i < resultData.result.gnrlData.length; i++) {
                    if (resultData.result.gnrlData[i].prodId === svcInfo.prodId) {
                      const tempData = resultData.result.gnrlData.splice(i, 1);
                      resultData.result.gnrlData.unshift(tempData[0]);
                      break;
                    }
                  }
                }
                const remainData = new MyTDataHotData().parseCellPhoneUsageData(resultData.result, svcInfo);
                if ( searchResult.result.search[0].immediate.data[0].subData = remainData.gnrlData[0].showRemained ) {
                  searchResult.result.search[0].immediate.data[0].subData = remainData.gnrlData[0].showRemained;
                } else {
                  searchResult.result.search[0].immediate.data[0].subData = {'data': remainData.gnrlData[0].remained, 'unit': ''};
                }
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 3:
            this._requestHotbillInfo().
            subscribe((resultData) => {
              if (FormatHelper.isEmpty(resultData) || resultData.resp.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.resp.result.hotBillInfo[0].totOpenBal2;
              }
            },
              () => {
                searchResult = removeImmediateData(searchResult);
                showSearchResult(searchResult, relatedKeyword , this);
              },
              () => {
                showSearchResult(searchResult, relatedKeyword , this);
              });
            break;
          case 4:
            this.apiService.request(API_CMD.BFF_05_0079, { payMethod : 'ALL'}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.totalSumPrice);
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 5:
            this.apiService.request(API_CMD.BFF_11_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].mainData = resultData.result.mbrGrCd;
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.mbrUsedAmt);
                searchResult.result.search[0].immediate.data[0].barcode = FormatHelper.addCardSpace(resultData.result.mbrCardNum);
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          default:
            searchResult.result.search[0].immediate.data[0].subData = svcInfo.prodNm;
            showSearchResult(searchResult, relatedKeyword , this);
            break;
        }
      }
    });

  }

  private _requestHotbillInfo(): Observable<any> {
    const self = this;
    const params = { count: 0 };
    return self.apiService.request(API_CMD.BFF_05_0022, params, {})
      .pipe(
        delay(2500), // 요청 후 2.5초 후 조회
        mergeMap(res => {
            return self._getBillResponse(false)
              .catch(error => {
                if ( error.message === 'Retry again' ) {
                  return self._getBillResponse(true);
                } else {
                  throw Error(error.message);
                }
              });
          }
        )
      );
  }

  private _getBillResponse(isRetry: boolean): Observable<any> {
    const self = this;
    const params = { count: !isRetry ? 1 : 2 };
    return self.apiService.request(API_CMD.BFF_05_0022, params, {})
      .map(resp => {
        if ( resp.code !== API_CODE.CODE_00 ) {
          return null;
        } else if ( !resp.result.hotBillInfo[0] || !resp.result.hotBillInfo[0].record1 ) {
          // 2번째 시도에도 fail이면 error 처리
          if ( isRetry ) {
            throw Error(MYT_FARE_HOTBILL_TITLE.ERROR.BIL0063);
          }
          // catch block 에서 retry 시도
          throw Error('Retry again');
        }
        return { resp };
      });
  }
}

export default CommonSearch;
