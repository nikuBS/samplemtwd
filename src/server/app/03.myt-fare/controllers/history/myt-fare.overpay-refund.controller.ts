/**
 * FileName: myt-fare.overpay-refund.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
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

    // this.logger.info(this, req.path.split('/').splice(-1)[0], req.path.split('/').splice(-2)[0]);

    res.render('history/myt-fare.overpay-refund.history.html', {svcInfo: svcInfo, data: {
      current: query.current
    }});
    // 환불 계좌 입력
    // res.render('history/myt-fare.overpay-refund.add-account.html', {svcInfo: svcInfo});
  }

}

export default MyTFareOverpayRefund;
