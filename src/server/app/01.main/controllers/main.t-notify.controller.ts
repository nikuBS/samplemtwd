/**
 * FileName: main.t-notify.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { SVC_ATTR_E } from '../../../types/bff.type';

class MainTNotify extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any) {
    let history = [];
    console.log('render', svcInfo.expsSvcCnt, svcInfo.svcAttrCd);

    if ( !FormatHelper.isEmpty(svcInfo) && svcInfo.expsSvcCnt !== '0' && svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
      Observable.combineLatest(
        this.getChangeProduct(),
        this.getGiftHistory()
      ).subscribe(([product, gift]) => {
        history = history.concat(product);
        history = history.concat(gift);
        console.log(history);
        res.render('main.t-notify.html', { svcInfo, history });
      });
    } else {
      res.render('main.t-notify.html', { svcInfo, history });
    }


  }

  private getChangeProduct(): Observable<any> {
    let product = [];
    return this.apiService.request(API_CMD.BFF_04_0002, {
      searchYymm: DateHelper.getYearMonth(new Date())
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        product = this.parseProduct(resp.result);
      }
      return product;
    });
  }

  private parseProduct(product): any {
    return product;
  }

  private getGiftHistory(): Observable<any> {
    let gift = [];
    return this.apiService.request(API_CMD.BFF_06_0018, {
      fromDt: DateHelper.getCurrentShortDate(new Date(new Date().setDate(1))),
      toDt: DateHelper.getCurrentShortDate()
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        gift = this.parseGift(resp.result);

      }
      return gift;
    });
  }

  private parseGift(gift): any {
    return gift;
  }

}

export default MainTNotify;
