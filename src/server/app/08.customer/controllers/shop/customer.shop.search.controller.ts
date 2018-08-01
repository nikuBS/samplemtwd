/**
 * FileName: customer.shop-search.controller.ts (CI_02_01)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';

class CustomerShopSearchController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const url = './shop/customer.shop.search.html';
    const query = req.query;

    const searchType = query.searchType;
    delete query.searchType;

    if (!FormatHelper.isEmpty(query) && !FormatHelper.isEmpty(query.searchText)) {
      // TODO: Check api availability
      this.requestSearch(query).subscribe((result) => {
        res.render(url, {
          svcInfo: svcInfo,
          searched: true,
          searchType: searchType,
          searchText: query.searchText,
          result: [result]
        });
      });
    } else {
      res.render(url, {
        svcInfo: svcInfo,
        searched: false
      });

    }
  }

  private requestSearch(params: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0004, params);
  }
}

export default CustomerShopSearchController;
