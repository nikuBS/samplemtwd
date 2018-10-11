/**
 * FileName: myt-join.info.discount.month.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.04
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_INFO_DISCOUNT_MONTH } from '../../../../types/string.type';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';

const VIEW = {
  DEFAULT: 'info/myt-join.info.discount.month.html',
  ERROR: 'error.server-error.html',
};
const MAX_ITEM_LENGTH_PER_PAGE = 20;

class MyTJoinInfoDiscountMonth extends TwViewController {
  private _svcAgrmtCdId: any; // 약정할인 ID
  private _svcAgrmtDcCd: any; // 약정할인 코드

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this._svcAgrmtCdId = req.query._svcAgrmtCdId;
    this._svcAgrmtDcCd = req.query._svcAgrmtDcCd;

    Observable.combineLatest(
      this.reqDiscountInfosMonth()
    ).subscribe(([discountInfosMonth]) => {
      const apiError = this.error.apiError([
        discountInfosMonth
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return res.render(VIEW.ERROR, {
          title: MYT_INFO_DISCOUNT_MONTH.TITLE,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const data = this.getFormattedData(discountInfosMonth);

      res.render(VIEW.DEFAULT, {
        svcAgrmtCdId: this._svcAgrmtCdId,
        svcAgrmtDcCd: this._svcAgrmtDcCd,
        data,
        svcInfo
      });
    }, (resp) => {
      return res.render(VIEW.ERROR, {
        title: MYT_INFO_DISCOUNT_MONTH.TITLE,
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
    });
  }

  private reqDiscountInfosMonth(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0076, {
      svcAgrmtCdId: this._svcAgrmtCdId,
      svcAgrmtDcCd: this._svcAgrmtDcCd
    });

    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': '00',
    //       'msg': 'success',
    //       'result': {
    //         'agrmt': [
    //           {
    //             'invoDt': '20170930',
    //             'invCnt': '1',
    //             'penEstDcAmt': '0',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20170831',
    //             'invCnt': '2',
    //             'penEstDcAmt': '0',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20160731',
    //             'invCnt': '3',
    //             'penEstDcAmt': '0',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20160630',
    //             'invCnt': '4',
    //             'penEstDcAmt': '0',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20150531',
    //             'invCnt': '5',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20150531',
    //             'invCnt': '6',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20140531',
    //             'invCnt': '7',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20140531',
    //             'invCnt': '8',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20140531',
    //             'invCnt': '9',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20140531',
    //             'invCnt': '10',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20140531',
    //             'invCnt': '11',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           },
    //           {
    //             'invoDt': '20130531',
    //             'invCnt': '12',
    //             'penEstDcAmt': '-4344',
    //             'perEstRt': '0'
    //           }
    //         ]
    //       }
    //     };
    //     if ( resp.code === API_CODE.CODE_00 ) {
    //       observer.next(resp);
    //       observer.complete();
    //     } else {
    //       observer.error();
    //     }
    //   }, 500);
    // });
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
      agrmt.showYear = moment(agrmt.invoDt).year();
      agrmt.showInvoDt = DateHelper.getShortDateWithFormat(agrmt.invoDt, 'MM.DD', 'YYYYMMDD');
      agrmt.showPenEstDcAmt = FormatHelper.addComma(agrmt.penEstDcAmt);
    });

    data['agrmts'] = agrmts;

    return data;
  }

}

export default MyTJoinInfoDiscountMonth;
