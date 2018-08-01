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
      query.searchText = encodeURI(query.searchText); // Encode korean chracters
      this.requestSearch(query, searchType).subscribe((resp) => {
        resp.result = resp.result.filter((item, idx) => idx < 19);
        res.render(url, {
          svcInfo: svcInfo,
          searched: true,
          searchType: searchType,
          searchText: decodeURI(query.searchText),
          result: FormatHelper.isEmpty(resp.result) ? [] : resp.result
        });
      });
    } else {
      res.render(url, {
        svcInfo: svcInfo,
        searched: false
      });

    }
  }

  private requestSearch(params: any, searchType: string): Observable<any> {
    const cmd = ((type) => {
      switch (type) {
        case 'name':
          return API_CMD.BFF_08_0004;
          break;
        case 'address':
          return API_CMD.BFF_08_0005;
          break;
        case 'tube':
          return API_CMD.BFF_08_0006;
          break;
        default:
          return API_CMD.BFF_08_0004;
          break;
      }
    })(searchType);
    return this.apiService.request(cmd, params);
  }
}

export default CustomerShopSearchController;
