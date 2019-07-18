/**
 * @file customer.agentsearch.happycom.controller.ts
 * @author 양정규
 * @since 2019-07-03
 * @desc 이용안내 > 지점/대리점, A/S센터>  행복커뮤니티 센터
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {BRANCH_SEARCH_OPTIONS, HAPPYCOM_SEARCH_OPTIONS} from '../../../../types/string.type';

export default class CustomerAgentsearchHappycom extends TwViewController {

  constructor() {
    super();
  }

  private queryParams: any;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    const optionsString = req.query.options;

    const locationOrder = FormatHelper.isEmpty(req.query.locationOrder) ? 1 : req.query.locationOrder; // 지역 위치 - 1부터 시작, 서울
    const locationOrderName = req.query.locationOrderName; // 지역 위치 이름
    const keyword = FormatHelper.isEmpty(req.query.keyword) ? '' : req.query.keyword;

    const page = req.query.page ? parseInt(req.query.page, 10) : 1;

    this.getQueryResult(optionsString, keyword, locationOrder, page, res, svcInfo, pageInfo).subscribe(
      (result) => {
        if (FormatHelper.isEmpty(result)) {
          return;
        }

        // type, storeType, area, line,
        res.render('agentsearch/customer.agentsearch.happycom.html', {
          isSearch: FormatHelper.isEmpty(req.query.keyword) ? false : true,
          keyword,
          optionsText: this.makeOptionsText(optionsString),
          result,
          params: this.queryParams,
          page,
          svcInfo,
          pageInfo,
          locationOrderName,
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
   * @desc   API 조회하고 결과 return
   * @param  {string} options - 필터 검색 speedYn: '스마트 기초 과정', applEduYn: '스마트 응용 과정', codingEduYn: '코딩교실'
   * @param  {string} keyword - 검색 keyword
   * @param  {string|undefined} locationOrder - 매장 지역 위치
   * @param  {number} page - 몇번째 page인지
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable
   */
  private getQueryResult(options: string, keyword: string, locationOrder: string,
                         page: number, res: Response,
                         svcInfo: any, pageInfo: any): Observable<any> {

    const params = {
      searchText: encodeURIComponent(keyword),
      currentPage: page,
      locationOrder,
      storeType: 0 // 매장형태 (0:전체, 1:지점, 2:대리점)
    };

    let isAll = true;
    if (!FormatHelper.isEmpty(options)) {
      isAll = false;
      options.split('::').map((option) => params[option] = 'Y');
    } else {
      // 전체 검색일 경우 필터값 3개 전부 'N'으로 설정하여 보낸다.
      params['speedYn'] = 'N';      // 스마트폰 기초 과정 여부
      params['applEduYn'] = 'N';    // 스마트폰 응용 과정 여부
      params['codingEduYn'] = 'N';  // 코딩 교실 여부
    }

    return this.apiService.request(API_CMD.BFF_08_0079, params).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // js 파일로 던져질 params
        if (isAll) {
          delete params['speedYn'];
          delete params['applEduYn'];
          delete params['codingEduYn'];
        }
        this.queryParams = { ...params, searchText: decodeURIComponent(params.searchText) };
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

  /**
   * @function
   * @desc option선택에 대해 화면에 표시해 줄 string 생성
   * @param  {string} options - 선택된 옵션들(speedYn: '스마트 기초 과정', applEduYn: '스마트 응용 과정', codingEduYn: '코딩교실')
   * @returns string
   */
  private makeOptionsText(options: string): any {
    let text = '';
    if (!FormatHelper.isEmpty(options)) {
      options.split('::').forEach((option, idx) => {
        if (idx > 0) {
          text += ', ';
        }
        text += HAPPYCOM_SEARCH_OPTIONS[option];
      });
    } else {
      text = HAPPYCOM_SEARCH_OPTIONS.all;
    }
    return text;
  }

}

