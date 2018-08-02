/**
 * FileName: customer.shop.detail.controller.ts (CI_02_04)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from '../../../../../../node_modules/rxjs/Observable';
import { API_CMD } from '../../../../types/api-command.type';

class CustomerShopDetailController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    const shopCode = req.query.code;

    this.requestShopDetail(shopCode).subscribe((resp) => {
      res.render('./shop/customer.shop.detail.html', {
        svcInfo: svcInfo,
        detail: resp.result,
        detail2: { // for test
          storeName: '유키대리점',
          searchAddr: '서울 중구 어쩌고 저쩌고......',
          jibunAddr: '명동 11번지 16층',
          tel: '02-111-111',
          geoX: '126.99185612271496',
          geoY: '37.559779110967696',
          custRateAvg: '4',
          custRateCnt: '10',
          weekdayOpenTime: '0900',
          weekdayCloseTime: '2100',
          satOpenTime: '0900',
          satCloseTime: '1600',
          holidayOpenTime: '0900',
          holidayCloseTime: '1600',
          talkMap: '1.구술약도:.#^2.대중교통:.222222222222',
          premium: 'Y',
          direct: 'Y',
          rent: 'Y',
          skb: 'Y',
          apple: 'Y',
          agnYn: 'Y',
          authAgnYn: 'Y',
          star: 'star2'
        }
      });
    });
  }

  private requestShopDetail(shopCode: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0007, { locCode: shopCode });
  }
}

export default CustomerShopDetailController;
