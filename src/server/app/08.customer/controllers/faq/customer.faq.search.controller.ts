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

class CustomerFaqSearch extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {
    const keyword = req.query.keyword;
    this.getSearchResult(keyword, res, svcInfo, pageInfo).subscribe(
      (result) => {
        if (!FormatHelper.isEmpty(result)) {
          res.render('faq/customer.faq.search.html', {
            svcInfo, pageInfo,
            result: result.content,
            total: parseInt(result.totalElements, 10),
            keyword
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
  private getSearchResult(keyword: string, res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0050, {
      srchKey: encodeURIComponent(keyword),
      page: 0,
      size: 20
    }).map((resp) => {
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
}

export default CustomerFaqSearch;
