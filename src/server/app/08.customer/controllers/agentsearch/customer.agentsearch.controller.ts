/**
 * @file customer.agentsearch.search.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2018.10.16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { BRANCH_SEARCH_OPTIONS } from '../../../../types/string.type';
import { NextFunction } from 'connect';

enum SearchType {
  NAME = 'name',
  ADDR = 'addr',
  TUBE = 'tube'
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
      const keyword = req.query.keyword;
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

  private makeOptionsText(storeType: string, options: string): string {
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
      if (count > 1) {
        text += BRANCH_SEARCH_OPTIONS.etc + (count - 1) + BRANCH_SEARCH_OPTIONS.count;
      }
    }

    return text;
  }
}

export default CustomerAgentsearch;
