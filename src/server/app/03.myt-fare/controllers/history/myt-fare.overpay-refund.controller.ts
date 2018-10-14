/**
 * FileName: myt-fare.overpay-refund.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {MYT_STRING_KOR_TERM} from '../../../../types/string.type';
import {API_CMD} from '../../../../types/api-command.type';
// import {API_CMD, API_CODE} from '../../../../types/api-command.type';

// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

// import FormatHelper from '../../../../utils/format.helper';
// import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class MyTFareOverpayRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    if (query.current === 'overpay-refund') {
      this.apiService.request(API_CMD.BFF_07_0030, {}).subscribe((resData) => {

        // this.logger.info(this, resData.result);

        this.renderListView(res, svcInfo, query, resData.result.refundPaymentRecord);
      //   res.render(viewFileName, {
      //     svcInfo: svcInfo, currentMonth: currentMonthKor,
      //     data: {termSelectValue: this.termSelectValue}, historyData: JSON.stringify(this.histData)
      //   });
      });

    } else if (query.current === 'detail') {
      this.renderDetailView(res, svcInfo, query);
    }



    // this.logger.info(this, req.path.split('/').splice(-1)[0], req.path.split('/').splice(-2)[0]);
  }

  renderListView(res: Response, svcInfo: any, query: Query, data: any) {

    // this.logger.info(this, data);

    res.render('history/myt-fare.overpay-refund.history.html', {svcInfo: svcInfo, data: {
      current: query.current,
        data: data
    }});
  }

  renderDetailView(res: Response, svcInfo: any, query: Query) {

    res.render('history/myt-fare.overpay-refund.history.detail.html', {svcInfo: svcInfo, data: {
        current: query.current
      }});
  }

}

export default MyTFareOverpayRefund;
