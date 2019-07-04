/**
 * @file 지점/대리점 검색 화면 처리
 * @author Hakjoon sim
 * @since 2018-10-16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { BRANCH_SEARCH_OPTIONS } from '../../../../types/string.type';
import { NextFunction } from 'connect';

enum SearchType {
  NAME = 'name',  // 이름 검색
  ADDR = 'addr',  // 주소 검색
  TUBE = 'tube'   // 지하철역 검색
}

class CustomerAgentsearch extends TwViewController {

  private queryParams: any;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    if (FormatHelper.isEmpty(req.query)) {
      res.render('agentsearch/customer.agentsearch.html', { isSearch: false, svcInfo, pageInfo });
    } else {
      const type = req.query.type;  // 'name', 'addr', 'tube'
      const storeType = req.query.storeType;  // 0: 전체, 1: 지점, 2: 대리점
      const area = req.query.area ? req.query.area.split(':')[0] : undefined;
      const line = req.query.line ? req.query.line.split(':')[0] : undefined;
      const keyword = !!area && !!line ? req.query.keyword.split(':')[0] : req.query.keyword;
      // const keyword = req.query.keyword;
      const optionsString = req.query.options;
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;
      this.getQueryResult(type, storeType, keyword, area, line, optionsString, page, res, svcInfo, pageInfo).subscribe(
        (result) => {
          if (FormatHelper.isEmpty(result)) {
            return;
          }

          const total = parseInt(result.totalCount, 10);
          const lastPage = Math.floor(total / 20) + (total % 20 ? 1 : 0);
          res.render('agentsearch/customer.agentsearch.html', {
            isSearch: true,
            type,
            keyword,
            optionsText: this.makeOptionsText(storeType, optionsString),
            result,
            params: this.queryParams,
            page,
            lastPage,
            svcInfo,
            pageInfo
          });
        },
        (err) => {
          this.error.render(res, {
            code: err.code,
            msg: err.msg,
            pageInfo: pageInfo,
            svcInfo
          });
        }
      );
    }
  }

  /**
   * @function
   * @desc 이름, 주소, 지하철역 중 하나로 검색 API 조회하고 결과 return
   * @param  {string} type - 이름, 주소, 지하철역 중
   * @param  {string} storeType - 전체/지점/대리점 중
   * @param  {string} keyword - 검색 keyword
   * @param  {string|undefined} area - 지하철역 검색인 경우 지역(수도권, 부산, 대구 등)
   * @param  {string|undefined} line - 지하철 line 정보(1호선, 2호선 등)
   * @param  {string} options - 검색 옵션 (TPremiumStore, apple 취급점 등)
   * @param  {number} page - 몇번째 page인지
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable
   */
  private getQueryResult(type: string, storeType: string, keyword: string, area: string | undefined,
                         line: string | undefined, options: string, page: number, res: Response,
                         svcInfo: any, pageInfo: any): Observable<any> {
    let api = API_CMD.BFF_08_0004;
    switch (type) {
      case SearchType.NAME:
        api = API_CMD.BFF_08_0004;
        break;
      case SearchType.ADDR:
        api = API_CMD.BFF_08_0005;
        break;
      case SearchType.TUBE:
        api = API_CMD.BFF_08_0006;
        break;
      default:
        break;
    }

    const params = {
      searchText: encodeURIComponent(keyword),
      storeType,
      currentPage: page
    };

    if (area && line) {
      params['searchAreaNm'] = encodeURIComponent(area);
      params['searchLineNm'] = encodeURIComponent(line);
    }

    if (!FormatHelper.isEmpty(options)) {
      options.split('::').map((option) => params[option] = 'Y');
    }

    this.queryParams = { ...params, searchText: decodeURIComponent(params.searchText) };

    return this.apiService.request(api, params).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo
      });

      return undefined;
    });
  }

  /**
   * @function
   * @desc 전체/지점/대리점 그리고 TPremiumStore, Apple 취급점 등의 option선택에 대해 화면에 표시해 줄 string 생성
   * @param  {string} storeType - 전체/지점/대리점
   * @param  {string} options - 선택된 옵션들(TPremiumStore, Apple취급점 등)
   * @returns string
   */
  private makeOptionsText(storeType: string, options: string): any {
    let text = BRANCH_SEARCH_OPTIONS[storeType];
    let optionToShow = '';
    let count = 0;
    if (!FormatHelper.isEmpty(options)) {
      options.split('::').forEach((option) => {
        count++;
        if (FormatHelper.isEmpty(optionToShow)) {
          optionToShow = BRANCH_SEARCH_OPTIONS[option];
        }
      });
    }
    if (count > 0) {
      text += ', ' + optionToShow;
      // if (count > 1) {
        // return {text,count};  // 옵션의 처리 업무가 1개 이상일 때 리턴
      //   text += BRANCH_SEARCH_OPTIONS.etc + (count - 1) + BRANCH_SEARCH_OPTIONS.count;
      // }
    }

    // const optionsAbc = {textabc : text,countabc : count};
    // this.logger.info(this, '[ text ] : ', text);
    // this.logger.info(this, '[ count ] : ', count);
    // return text;
    // return optionsAbc;
    return {text,count};
  }
}

export default CustomerAgentsearch;
