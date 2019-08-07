/**
 * @file customer.faq.search.controller.ts
 * @author Hakjoon sim
 * @since 2018-11-05
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { CUSTOMER_FAQ_SEARCH_FILTER } from '../../../../types/string.type';

class CustomerFaqSearch extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {
    const keyword = req.query.keyword;
    const selectedSearchCategoryName = !FormatHelper.isEmpty(req.query.selectedSearchCategory) ? req.query.selectedSearchCategory.split(':')[0] : '';
    const selectedSearchCategory = !FormatHelper.isEmpty(req.query.selectedSearchCategory) ? req.query.selectedSearchCategory.split(':')[1] : '';
    const searchFltIds = req.query.searchFltIds;
      
    
    // this.logger.info(this, '[현재 TS의 selectedSearchCategoryName은? ]', selectedSearchCategoryName);
    // this.logger.info(this, '[현재 TS의 selectedSearchCategory 은 code? ]', selectedSearchCategory);
    // this.logger.info(this, '[현재 TS의 searchFltIds 는 emply true , false ? ]', FormatHelper.isEmpty(searchFltIds));

    // this.logger.info(this, '[현재 TS의 searchFltIds 는? ]', searchFltIds);
    
    this.getSearchResult(keyword, selectedSearchCategory, searchFltIds, res, svcInfo, pageInfo).subscribe(
      (result) => {
        if (!FormatHelper.isEmpty(result)) {
          res.render('faq/customer.faq.search.html', {
            svcInfo, pageInfo,
            result: result.content,
            total: parseInt(result.totalElements, 10),
            keyword,
            searchInfo : {
              selectedSearchCategoryName,
              selectedSearchCategory,
              searchFilters: ( FormatHelper.isEmpty(searchFltIds) ? false : this.getSearchFilters(searchFltIds))
            }
          });
        }
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

  /**
   * @function
   * @desc FAQ 검색 API 조회
   * @param  {string} keyword - 검색할 keyword
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable - 검색결과
   */
  private getSearchResult(keyword: string, selectedSearchCategory: string, searchFltIds: string, res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    // this.logger.info(this, '[현재 TS의 API 호출전 searchFltIds 는? : ]', searchFltIds);
    const apiParam = {
      supIfaqGrpCd : selectedSearchCategory,
      // ifaqGrpCd : searchFltIds,
      // ifaqGrpCd : null,
      srchKey: encodeURIComponent(keyword),
      page: 0,
      size: 20
    }
    if (!FormatHelper.isEmpty(searchFltIds)){
      apiParam['ifaqGrpCd'] = searchFltIds;
    }
    // this.logger.info(this, '[현재 TS의 API 호출전 apiParam 는? : ]', apiParam);

    return this.apiService.request(API_CMD.BFF_08_0050, apiParam).map((resp) => {
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
   * @desc 필터 ID를 기준으로 필터 Name 매핑하여 리턴
   * @param  {string} searchFltIds - 필터 아이디
   * @returns object - 필터이름 및 필터 개수
   */
  private getSearchFilters(searchFltIds: string): any {

    let searchFltNames = '';
    let count = 0;
    if (!FormatHelper.isEmpty(searchFltIds)) {
      searchFltIds.split(',').forEach((option) => {
        count++;
        FormatHelper.isEmpty(searchFltNames) ? searchFltNames = CUSTOMER_FAQ_SEARCH_FILTER[option] : searchFltNames += ', ' + CUSTOMER_FAQ_SEARCH_FILTER[option];
        });
      };
    // this.logger.info(this, '[ Thomas - searchFltNames 는 ?  ] : ', searchFltNames);
    // this.logger.info(this, '[ Thomas - typeof searchFltIds 는 ?  ] : ', typeof searchFltIds);
    // this.logger.info(this, '[ Thomas - searchFltIds 는 ?  ] : ', searchFltIds);
    // this.logger.info(this, '[ Thomas - count 는 ?  ] : ', count);
    
    return {searchFltIds, searchFltNames, count};
  }

}

export default CustomerFaqSearch;
