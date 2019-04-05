/**
 * @file main.t-notify.controller.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { PROD_CODE_E, SVC_ATTR_E, T_NOTIFY_TYPE } from '../../../types/bff.type';
import PROD_CHANGE from '../../../mock/server/home.t-notify.prod-chg';
import GIFT_LIST from '../../../mock/server/home.t-notify.gift';

class MainTNotify extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    let history = [];
    if ( !FormatHelper.isEmpty(svcInfo) && svcInfo.expsSvcCnt !== '0' && svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
      Observable.combineLatest(
        this.getChangeProduct(),
        this.getGiftHistory()
      ).subscribe(([product, gift]) => {
        history = history.concat(product);
        history = history.concat(gift);
        FormatHelper.sortObjArrDesc(history, 'rgstDt');
        const currentDate = {
          year: DateHelper.getCurrentYear(),
          month: DateHelper.getCurrentMonth()
        };
        res.render('main.t-notify.html', { svcInfo, history, currentDate, pageInfo});
      });
    } else {
      res.render('main.t-notify.html', { svcInfo, history, pageInfo });
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
      // product = this.parseProduct(PROD_CHANGE.result);
      return product;
    });
  }

  private parseProduct(products): any {
    const result = products.map((product) => {
      return {
        name: product.prodNm,
        type: product.prodCd === PROD_CODE_E.DEFAULT ? T_NOTIFY_TYPE.PROD : T_NOTIFY_TYPE.ADD,
        scrbTermCd: product.scrbTermCd,
        showDate: DateHelper.getKoreanDateWithDay(product.rgstDt),
        showTime: DateHelper.getKoreanTime(product.rgstDt + product.rgstTm),
        rgstDt: product.rgstDt
      };
    });
    return result;
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
      // gift = this.parseGift(GIFT_LIST.result);
      return gift;
    });
  }

  private parseGift(gifts): any {
    const result = gifts.map((gift) => {
      return {
        custNm: gift.custNm,
        svcNum: gift.svcNum,
        type: T_NOTIFY_TYPE.GIFT,
        giftType: gift.type,
        dataQty: gift.dataQty,
        showDate: DateHelper.getKoreanDateWithDay(gift.opDt),
        rgstDt: gift.opDt
      };
    });
    return result;
  }

}

export default MainTNotify;
