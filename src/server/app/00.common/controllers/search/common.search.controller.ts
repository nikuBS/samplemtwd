/**
 * 검색 결과 화면
 * @file common.search.controller.ts
 * @author Hyunkuk Lee ( max5500@pineone.com )
 * @since 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE, API_VERSION} from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import MyTDataHotData from '../../../02.myt-data/controllers/usage/myt-data.hotdata.controller';
import BrowserHelper from '../../../../utils/browser.helper';

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
    /**
     * 검색 결과 출력
     * @param searchResult 검색 결과
     * @param relatedKeyword 연관 검색어
     * @param thisObj 해당 객체
     * @returns void
     */
    function showSearchResult(searchResult, relatedKeyword , thisObj) {
      if ( searchResult.result.totalcount === 0 || from === 'empty' ) {
        Observable.combineLatest(
          thisObj.apiService.request(API_CMD.BFF_08_0070, {}, {}),
          thisObj.apiService.request(API_CMD.POPULAR_KEYWORD, {range : 'D'}, {})
        ).subscribe((resultObj) => {
          if (resultObj[1].code !== 0) {
            return thisObj.error.render(res, {
              svcInfo: svcInfo,
              pageInfo: pageInfo,
              code: resultObj[1].code,
              msg: resultObj[1].msg
            });
          }
          res.render('search/common.search.not-found.html', {
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
    /**
     * 즉답검색 결과 제거
     * @param searchResult 검색 결과
     * @returns {Object} 검색 결과
     */
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
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 4:
            this._getMicroRemain().
            subscribe((resultData) => {
              if (FormatHelper.isEmpty(resultData) || resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = FormatHelper.addComma(resultData.result.tmthUseAmt);
              }
            }, () => {
              searchResult = removeImmediateData(searchResult);
              showSearchResult(searchResult, relatedKeyword , this);
            }, () => {
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
          case 7:
            // console.log('❖❖❖❖❖❖❖❖❖❖❖ 부가서비스 검색 ❖❖❖❖❖❖❖❖❖❖❖');
            this.apiService.request(API_CMD.BFF_05_0137, {}, {})
            .subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 8:
            // console.log('❖❖❖❖❖❖❖❖❖❖❖ 음성잔여량 검색 ❖❖❖❖❖❖❖❖❖❖❖');
            this.apiService.request(API_CMD.BFF_05_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 9:
            // console.log('❖❖❖❖❖❖❖❖❖❖❖ 요금약정할인 검색 ❖❖❖❖❖❖❖❖❖❖❖');
            this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , this);
            });
            break;
          case 10:
            // console.log('❖❖❖❖❖❖❖❖❖❖❖ 단말기 할부금 검색 ❖❖❖❖❖❖❖❖❖❖❖');
            this.apiService.request(API_CMD.BFF_05_0063, {}, null, [], API_VERSION.V2).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
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
  /**
   * 잔여한도 조회 콜백
   * @returns {Object} 잔여한도
   */
  private _getMicroRemain(): Observable<any> {
    return this._getRemainLimit('Request', '0') // 최초 시도 시 Request, 0으로 호출
        .switchMap((resp) => {
          if (resp.code === API_CODE.CODE_00) {
            return this._getRemainLimit('Done', '1'); // 이후 Done, 1로 호출 (필수)
          } else {
            throw resp;
          }
        })
        .switchMap((next) => {
          if (next.code === API_CODE.CODE_00) {
            return Observable.of(next);
          } else {
            return Observable.timer(3000)
                .switchMap(() => {
                  return this._getRemainLimit('Done', '2'); // 위에서 응답이 없을 경우 3초 뒤 Done, 2로 호출
                });
          }
        })
        .switchMap((next) => {
          if (next.code === API_CODE.CODE_00) {
            return Observable.of(next);
          } else {
            return Observable.timer(3000)
                .switchMap(() => {
                  return this._getRemainLimit('Done', '3'); // 응답이 없을 경우 3초 뒤 Done, 3으로 호출
                });
          }
        });
  }

  /**
   * 잔여한도 조회
   * @returns {Object} 잔여한도
   */
  private _getRemainLimit(gubun: string, requestCnt: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0073, { gubun: gubun, requestCnt: requestCnt });
  }
}

export default CommonSearch;
