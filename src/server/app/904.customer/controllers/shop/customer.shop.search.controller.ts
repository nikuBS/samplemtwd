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
import { CUSTOMER_SEARCH_OPTIONS } from '../../../../types/string.old.type';

class CustomerShopSearch extends TwViewController {
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
        res.render(url, {
          svcInfo: svcInfo,
          searched: true,
          searchType: searchType, // 매장명(name), 주소(address), 전철역(tube)
          searchText: decodeURI(query.searchText),
          searchShopType: query.storeType,
          searchOptions: {
            premium: query.premium === 'Y' ? true : false,
            pickup: query.direct === 'Y' ? true : false,
            rental: query.rent === 'Y' ? true : false,
            skb: query.skb === 'Y' ? true : false,
            apple: query.apple === 'Y' ? true : false,
            official: query.authAgnYn === 'Y' ? true : false
          },
          optionsText: this.buildSearchOptionsTitleText(query),
          result: {
            totalCount: resp.result.totalCount,
            lastPage: resp.result.lastPageType === 'Y' ? true : false,
            list: resp.result.regionInfoList
          }
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

  private buildSearchOptionsTitleText(query: any): string {
    let ret = '';
    if (query.storeType === '0') {
      ret += CUSTOMER_SEARCH_OPTIONS.SHOP_TYPE_0;
    } else if (query.storeType === '1') {
      ret += CUSTOMER_SEARCH_OPTIONS.SHOP_TYPE_1;
    } else {
      ret += CUSTOMER_SEARCH_OPTIONS.SHOP_TYPE_2;
    }

    if (!FormatHelper.isEmpty(query.premium)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_PREMIUM;
    }
    if (!FormatHelper.isEmpty(query.direct)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_PICKUP;
    }
    if (!FormatHelper.isEmpty(query.rent)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_RENTAL;
    }
    if (!FormatHelper.isEmpty(query.skb)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_SKB;
    }
    if (!FormatHelper.isEmpty(query.apple)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_APPLE;
    }
    if (!FormatHelper.isEmpty(query.authAgnYn)) {
      ret += ', ' + CUSTOMER_SEARCH_OPTIONS.OPTION_OFFICIAL;
    }

    return ret;
  }
}

export default CustomerShopSearch;
