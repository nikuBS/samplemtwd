/**
 * @file 5gx 체험존 검색 화면 처리
 * @author ByungSo Oh
 * @since 2019-05-30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { BRANCH_SEARCH_OPTIONS } from '../../../../types/string.type';
import { NextFunction } from 'connect';


class CustomerAgentsearchExpZone5gx extends TwViewController {

  private queryParams: any;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
      
      const fiveOptionType = FormatHelper.isEmpty(req.query.fiveOptionType) ? 0 : req.query.fiveOptionType;  // 5gx 및 vr zone 필터 파라미터 , 0은 전체, 1은 5gx zone, 2는 vr zone
      const fiveOptionName = FormatHelper.isEmpty(req.query.fiveOptionName) ? '전체' : req.query.fiveOptionName;  // 5gx 및 vr zone 필터 이름

      // this.logger.info(this, '[ fiveOptionType - 보내기전] : ', fiveOptionType);
      // this.logger.info(this, '[ fiveOptionName - 보내기전] : ', fiveOptionName);

      const locationOrder = FormatHelper.isEmpty(req.query.locationOrder) ? 1 : req.query.locationOrder; // 체험관 지역 위치 - 1부터 시작, 서울
      const locationOrderName = FormatHelper.isEmpty(req.query.locationOrderName) ? '서울' : req.query.locationOrderName; // 체험관 지역 위치 이름

      const keyword = FormatHelper.isEmpty(req.query.keyword) ? '' : req.query.keyword;
     
      // this.logger.info(this, '[ locationOrder - 보내기전] : ', locationOrder);
      // this.logger.info(this, '[ locationOrderName - 보내기전] : ', locationOrderName);
      // this.logger.info(this, '[ keyword - 보내기전] : ', keyword);
      
      const page = req.query.page ? parseInt(req.query.page, 10) : 1;

      this.getQueryResult(fiveOptionType, keyword, locationOrder, page, res, svcInfo, pageInfo).subscribe(
        (result) => {
          if (FormatHelper.isEmpty(result)) {
            return;
          }

          // type, storeType, area, line, 

          const total = parseInt(result.totalCount, 10);
          const lastPage = Math.floor(total / 20) + (total % 20 ? 1 : 0);
          res.render('agentsearch/customer.agentsearch.expzone5gx.html', {
            isSearch: FormatHelper.isEmpty(req.query.keyword)? false : true,
            keyword,
            // optionsText: this.makeOptionsText(storeType, optionsString),
            result,
            params: this.queryParams,
            page,
            lastPage,
            svcInfo,
            pageInfo,
            locationOrderName,
            fiveOptionName
            // decodeURIComponent(locationOrderName),
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
    // }
  }

  /**
   * @function
   * @desc 이름, 주소, 지하철역 중 하나로 검색 API 조회하고 결과 return
   * @param  {string} fiveOptionType -   5gx 및 vr zone 요청 파라미터 , 0은 전체, 1은 5gx zone, 2는 vr zone
   * @param  {string} keyword - 검색 keyword
   * @param  {string|undefined} locationOrder - 체험관 지역 위치
   * @param  {number} page - 몇번째 page인지
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable
   */
  private getQueryResult(fiveOptionType: string, keyword: string, locationOrder : string,
                         page: number, res: Response,
                         svcInfo: any, pageInfo: any): Observable<any> {
                          
    
    let api = API_CMD.BFF_08_0077;


    const params = {
      searchText: encodeURIComponent(keyword),
      currentPage: page,
      locationOrder,
      fiveOptionType
    };

    // js 파일로 던져질 params
    this.queryParams = { ...params, searchText: decodeURIComponent(params.searchText) };  

    return this.apiService.request(api, params).map((resp) => {
    // return this.apiService.request(API_CMD.BFF_08_0077, {}).map((resp) => {
      this.logger.info(this, '[ params ] : ', params);
      this.logger.info(this, '[ resp.result ] : ', resp.result);
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
  } // end of getQueryResult

} // end of CustomerAgentsearchExpZone5gx

export default CustomerAgentsearchExpZone5gx;
