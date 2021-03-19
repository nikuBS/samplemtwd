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
import LoggerService from '../../../../services/logger.service';
import { request } from 'https';

class CommonSearch extends TwViewController {
  private readonly log;
  constructor() {
    super();
    this.log = new LoggerService();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const query =  StringHelper.encodeURIAllCase(req.query.keyword);
    let collection = 'all';
    const step = req.header('referer') ? req.query.step ? req.query.step : 1 : 1;
    const from = req.header('referer') ? req.query.from : null;
    const pageNum = req.query.page || 1;
    let sort = req.query.sort || 'shortcut-C.rate-C.service-C.tv_internet-C.troaming-C.direct-D';
    let redirectParam = req.query.redirect || 'Y';
    const _this = this;
    // const sort = 'A';  // 추천순 (Admin)
    // const sort = 'D';  // 최신순 (Date)
    // const sort = 'H';  // 높은가격순 (HighPrice)
    // const sort = 'L';  // 낮은가격순 (LowPrice)
    // const sort = 'C';  // 클릭순 (Click)
    // const sort = 'R';  // 정확도순 (Rank)
    // let sort = 'shortcut-A.rate-H.service-L.tv_internet-A.troaming-D.tapp-D.direct-D.tmembership-R.event-D.sale-C
    // .as_outlet-R.question-D.notice-D.prevent-D.manner-D.serviceInfo-D.siteInfo-D.bundle-A';
    // const sort = 'shortcut-A.rate-H.service-H.tv_internet-L.troaming-A.tapp-A.direct-A.tmembership-A.event-A
    // .sale-A.as_outlet-A.question-A.notice-A.prevent-A.manner-A.serviceInfo-A.siteInfo-A.bundle-A';

    // this.log.info(this, '[common.search.in-result.controller] req.query : ', req.query);  // keyword=소액결제, in_keyword=내역, step=3

    let requestObj, researchCd, researchQuery, searchApi ;
    /**
     * 검색 결과 출력
     * @param searchResult 검색 결과
     * @param relatedKeyword 연관 검색어
     * @param requestObject
     * @param thisObj 해당 객체
     * @returns void
     */
    function showSearchResult(searchResult, relatedKeyword , requestObject , thisObj) {
      _this.logger.info(_this, '[common.search.controller] [showSearchResult]', '###########################################################');
      _this.logger.info(_this, '[common.search.controller] [showSearchResult]', '');
      _this.logger.info(_this, '[common.search.controller] [showSearchResult] redirectParam : ', redirectParam);
      _this.logger.info(_this, '[common.search.controller] [showSearchResult]', '###########################################################');

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
        // 2020.01.16 이전일 [S]
        // OP002-5939 의 경우 요건 담당 매니저 최종 컨펌이 나지 않아
        // shortcut 검색결과가 없는 경우 rank 값이 가장 높은 컬렉션으로 리다이렉트 시키는 부분은 제외처리함.
        redirectParam = 'N';
        // 2020.01.16 이전일 [E]

        if (redirectParam !== 'N') {
          let redirectYn = 'Y';
          let tempCollection = '';
          _this.logger.info(_this, '[common.search.controller] #################################################', '');
          _this.logger.info(_this, '[common.search.controller] req.query : ', req.query);

          const tempAccessQuery = req.query;

          for (let idx = 0; idx < searchResult.result.search.length; idx++) {
            const keyName =  Object.keys(searchResult.result.search[idx])[0];
            const contentsCnt = Number(searchResult.result.search[idx][keyName].count);
            const rank = Number(searchResult.result.search[idx][keyName].rank);

            if (contentsCnt > 0) {
              if (keyName === 'shortcut') {
                redirectYn = 'N';
              }
              if (rank === 1) {
                tempCollection = keyName;
              }
            }
          }

          _this.logger.info(_this, '[common.search.controller] redirectYn : ', redirectYn);
          _this.logger.info(_this, '[common.search.controller] 리다이렉트할 컬렉션 : ', tempCollection);

          if (redirectYn === 'Y') {
            collection = tempCollection;
            _this.logger.info(_this, '[common.search.controller] 리다이렉트할 컬렉션 : ', collection);

            // tempAccessQuery = tempAccessQuery + '&category=' + collection;
            tempAccessQuery.category = collection;

            const startIdx = sort.indexOf(collection + '-') + collection.length + 1;
            sort = sort.substring(startIdx, startIdx + 1);

            _this.logger.info(_this, '[common.search.controller] 리다이렉트할 컬렉션 정렬기준 : ', sort);


            // tempAccessQuery = tempAccessQuery + '&sort=' + sort;
            tempAccessQuery.sort = sort;

            _this.logger.info(_this, '[common.search.controller] tempAccessQuery : ', tempAccessQuery);
            _this.logger.info(_this, '[common.search.controller] #################################################', '');

            if (FormatHelper.isEmpty(req.query.in_keyword)) {
              requestObject = { query , collection , pageNum , sort };
            } else {
              researchCd = 1;
              researchQuery = StringHelper.encodeURIAllCase(req.query.in_keyword) || '';
              requestObject = { query , collection , researchQuery , researchCd , pageNum , sort };
            }

            if (BrowserHelper.isApp(req)) {
              searchApi = API_CMD.SEARCH_APP;
              if ( BrowserHelper.isIos(req) ) {
                requestObject.device = 'I';
              } else {
                requestObject.device = 'A';
              }
            } else {
              searchApi = API_CMD.SEARCH_WEB;
            }

            if (!FormatHelper.isEmpty(svcInfo)) {
              requestObject.userId = svcInfo.userId;
            }




            Observable.combineLatest(
              _this.apiService.request( searchApi, requestObject, {}),
              _this.apiService.request(API_CMD.RELATED_KEYWORD, requestObject, {})
            ).subscribe(([ _searchResult, _relatedKeyword ]) => {
              if (_searchResult.code !== 0 || _relatedKeyword.code !== 0) {
                return _this.error.render(res, {
                  svcInfo: svcInfo,
                  pageInfo: pageInfo,
                  code: _searchResult.code !== 0 ? _searchResult.code : _relatedKeyword.code,
                  msg: _searchResult.code !== 0 ? _searchResult.msg : _relatedKeyword.msg
                });
              }
              if (FormatHelper.isEmpty(svcInfo) && _searchResult.result.totalcount === 1 &&
                collection === 'shortcut' && _searchResult.result.search[0].shortcut.data[0].DOCID === 'M000083') {
                _searchResult.result.totalcount = 0;
              }
              if ( _searchResult.result.totalcount === 0 ) {
                Observable.combineLatest(
                  _this.apiService.request(API_CMD.BFF_08_0070, {}, {}),
                  _this.apiService.request(API_CMD.POPULAR_KEYWORD, {range : 'D'}, {})
                ).subscribe(([surveyList, popularKeyword]) => {
                  if (surveyList.code !== API_CODE.CODE_00 || popularKeyword.code !== 0) {
                    return _this.error.render(res, {
                      svcInfo: svcInfo,
                      pageInfo: pageInfo,
                      code: surveyList.code !== API_CODE.CODE_00 ? surveyList.code : popularKeyword.code,
                      msg: surveyList.code !== API_CODE.CODE_00 ? surveyList.msg : popularKeyword.msg
                    });
                  }
                  res.render('search/common.search.not-found.html', {
                    pageInfo: pageInfo,
                    popularKeyword : popularKeyword.result,
                    keyword : _searchResult.result.query,
                    relatedKeyword : _relatedKeyword,
                    inKeyword : _searchResult.result.researchQuery,
                    surveyList : surveyList,
                    suggestQuery : _searchResult.result.suggestQuery,
                    step : step,
                    from : null
                  });
                });
              } else {
                res.render('search/common.search.more.html', {
                  pageInfo: pageInfo,
                  searchInfo : _searchResult.result,
                  keyword : _searchResult.result.query,
                  pageNum : pageNum,
                  relatedKeyword : _relatedKeyword,
                  inKeyword : _searchResult.result.researchQuery,
                  accessQuery : tempAccessQuery,
                  step : step,
                  nowUrl : req.originalUrl,
                  paramObj : tempAccessQuery,
                  sort: sort || 'A'
                });
              }
            });
          } else {
            let keywords: string = searchResult.result.query;
            let arrKeyword = keywords.split(' ');
            let arrKeywordSize: number = 0;
            if ('Y' === searchResult.result.orSearch) {
              arrKeywordSize = arrKeyword.length || 0;
            }
            res.render('search/common.search.html', {
              pageInfo: pageInfo,
              searchInfo : searchResult.result,
              keyword : searchResult.result.query,
              relatedKeyword : relatedKeyword,
              inKeyword : searchResult.result.researchQuery,
              step : step,
              from : from,
              sort : requestObject.sort,
              nowUrl : req.originalUrl,
              searchTotalCount: searchResult.result.totalcount,
              arrKeyword: arrKeyword,
              arrKeywordSize: arrKeywordSize,
              searchKategorie: _this._getSearchKategorie(searchResult.result)
            });
          }

        } else {
          let keywords: string = searchResult.result.query;
          let arrKeyword = keywords.split(' ');
          let arrKeywordSize: number = 0;
          if ('Y' === searchResult.result.orSearch) {
            arrKeywordSize = arrKeyword.length || 0;
          }
          res.render('search/common.search.html', {
            pageInfo: pageInfo,
            searchInfo : searchResult.result,
            keyword : searchResult.result.query,
            relatedKeyword : relatedKeyword,
            inKeyword : searchResult.result.researchQuery,
            step : step,
            from : from,
            sort : requestObject.sort,
            nowUrl : req.originalUrl,
            searchTotalCount: searchResult.result.totalcount,
            arrKeyword: arrKeyword,
            arrKeywordSize: arrKeywordSize,
            searchKategorie: _this._getSearchKategorie(searchResult.result)
          });
        }
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
      requestObj = { query , collection , sort };
    } else {
      researchCd = 1;
      researchQuery = StringHelper.encodeURIAllCase(req.query.in_keyword) || null;
      requestObj = { query , collection , researchQuery , researchCd , sort };
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

    requestObj.sort = sort;

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
      if (FormatHelper.isEmpty(svcInfo) && searchResult.result.totalcount === 1 &&
        searchResult.result.search[2].shortcut.data.length && searchResult.result.search[2].shortcut.data[0].DOCID === 'M000083') {
        searchResult.result.totalcount = 0;
      }
      if (searchResult.result.search[0].immediate.data.length <= 0 || svcInfo === null) {
        if (!FormatHelper.isEmpty(searchResult.result.search[0].immediate.data)) {
          searchResult = removeImmediateData(searchResult);
        }
        showSearchResult(searchResult, relatedKeyword , requestObj , this);
      } else {
        searchResult.result.search[0].immediate.data[0].mainData = StringHelper.phoneStringToDash(svcInfo.svcNum);
        searchResult.result.search[0].immediate.data[0].nameData = svcInfo.mbrNm;
        switch (Number(searchResult.result.search[0].immediate.data[0].DOCID)) {
          case 2:
            this.apiService.request(API_CMD.BFF_05_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
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
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
            }, () => {
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
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
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
            });
            break;
          case 7:
            console.log('❖❖❖❖❖❖❖❖❖❖❖ 부가서비스 검색 ❖❖❖❖❖❖❖❖❖❖❖');  
            // [OP002-9968] 의 배포 일정 연기 (9/17) 로 연기됨에 따라 기존 로직으로 복구함. 9/17 배포시에 본 로직은 제거 필요 [S]
            // this.apiService.request(API_CMD.BFF_05_0137, {}, {})
            // .subscribe((resultData) => {
            //   if (resultData.code !== API_CODE.CODE_00) {
            //     searchResult = removeImmediateData(searchResult);
            //   } else {
            //     searchResult.result.search[0].immediate.data[0].subData = resultData.result;
            //   }
            //   showSearchResult(searchResult, relatedKeyword , requestObj , this);
            // });
            // break;
            // [OP002-9968] 의 배포 일정 연기 (9/17) 로 연기됨에 따라 기존 로직으로 복구함. 9/17 배포시에 본 로직은 제거 필요 [E]

            // 아래 [OP002-9968] 의 변경사항은 배포 일정 연기 (9/17) 로 연기됨에 따라 원복처리함 [S]
            if (svcInfo && svcInfo.svcAttrCd.startsWith('S')) {
              this.apiService.request(API_CMD.BFF_05_0129, {}, {})
              .subscribe((resultData) => {
                if (resultData.code !== API_CODE.CODE_00) {
                  searchResult = removeImmediateData(searchResult);
                } else {
                  searchResult.result.search[0].immediate.data[0].subData = resultData.result;
                }
                showSearchResult(searchResult, relatedKeyword , requestObj , this);
              });
              break;
            } else {
              this.apiService.request(API_CMD.BFF_05_0161, {}, {})
              .subscribe((resultData) => {
                if (resultData.code !== API_CODE.CODE_00) {
                  searchResult = removeImmediateData(searchResult);
                } else {
                  searchResult.result.search[0].immediate.data[0].subData = resultData.result;
                }
                showSearchResult(searchResult, relatedKeyword , requestObj , this);
              });
              break;
            }
            // 아래 [OP002-9968] 의 변경사항은 배포 일정 연기 (9/17) 로 연기됨에 따라 원복처리함 [E]
          case 8:
            // console.log('❖❖❖❖❖❖❖❖❖❖❖ 음성잔여량 검색 ❖❖❖❖❖❖❖❖❖❖❖');
            this.apiService.request(API_CMD.BFF_05_0001, {}, {}).
            subscribe((resultData) => {
              if (resultData.code !== API_CODE.CODE_00) {
                searchResult = removeImmediateData(searchResult);
              } else {
                searchResult.result.search[0].immediate.data[0].subData = resultData.result;
              }
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
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
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
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
              showSearchResult(searchResult, relatedKeyword , requestObj , this);
            });
            break;
          default:
            searchResult.result.search[0].immediate.data[0].subData = svcInfo.prodNm;
            showSearchResult(searchResult, relatedKeyword , requestObj , this);
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

  /**
   * 카테고리별 검색 결과 정보를 구한다
   * @param result 검색 결과
   * @returns 카테고리별 검색 결과 정보
   */
  private _getSearchKategorie(result: any): any {
    const searchKategorie = {
      immediate: {},
      smart: {},
      shortcut: {},
      rate: {},
      service: {},
      tv_internet: {},
      troaming: {},
      tapp: {},
      direct: {},
      phone: {},
      tablet: {},
      accessory: {},
      tmembership: {},
      event: {},
      sale: {},
      as_outlet: {},
      notice: {},
      prevent: {},
      question: {},
      manner: {},
      serviceInfo: {},
      siteInfo: {},
      banner: {},
      bundle: {},
      lastevent: {}
    };

    const keyArr: Array<string> = Object.keys(searchKategorie);
    let key: string;

    if ( result && result.search && result.search.length > 0 ) {
      result.search.forEach(search => {
        for ( let i = 0; i < keyArr.length; i++ ) {
          key = keyArr[i];
          if ( search[key] ) {
            searchKategorie[key] = search[key];
            break;
          }
        }
      });
    }

    return searchKategorie;
  }
}

export default CommonSearch;