/**
 * FileName: myt-join.info.discount.month.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.04
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD } from '../../../../types/api-command.type';
import { MYT_INFO_DISCOUNT_MONTH } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

const VIEW = {
  DEFAULT: 'info/myt-join.info.discount.month.html'
};
const MAX_ITEM_LENGTH_PER_PAGE = 20;

class MyTJoinInfoDiscountMonth extends TwViewController {
  private _svcAgrmtDcId: any; // 약정할인 ID
  private _svcAgrmtDcCd: any; // 약정할인 코드

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this._svcAgrmtDcId = req.query.svcAgrmtDcId;
    this._svcAgrmtDcCd = req.query.svcAgrmtDcCd;

    Observable.combineLatest(
      this.reqDiscountInfosMonth()
    ).subscribe(([discountInfosMonth]) => {
      const apiError = this.error.apiError([
        discountInfosMonth
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const data = this.getFormattedData(discountInfosMonth);

      res.render(VIEW.DEFAULT, {
        svcAgrmtDcId: this._svcAgrmtDcId,
        svcAgrmtDcCd: this._svcAgrmtDcCd,
        data,
        svcInfo,
        pageInfo
      });
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  private reqDiscountInfosMonth(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0076, {
      svcAgrmtCdId: this._svcAgrmtDcId,
      svcAgrmtDcCd: this._svcAgrmtDcCd
    });
  }

  private getFormattedData(resp: any): any {
    const data = {};
    const agrmts = resp.result.agrmt;
    if (agrmts.length > MAX_ITEM_LENGTH_PER_PAGE) {
      data['showMoreBtn'] = true;
      agrmts.splice(MAX_ITEM_LENGTH_PER_PAGE);
    } else {
      data['showMoreBtn'] = false;
    }

    agrmts.map((agrmt) => {
      agrmt.showInvoDt = DateHelper.getShortDate(agrmt.invoDt);
      agrmt.showPenEstDcAmt = FormatHelper.addComma(agrmt.penEstDcAmt);
    });

    data['agrmts'] = agrmts;

    return data;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MYT_INFO_DISCOUNT_MONTH.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo,
      svcInfo
    });
  }

}

export default MyTJoinInfoDiscountMonth;
