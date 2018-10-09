/**
 * FileName: myt-fare.payment.history.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_PAYMENT_HISTORY_TYPE} from '../../../../types/string.type';
// import {API_CMD, API_CODE} from '../../../../types/api-command.type';

// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

// import FormatHelper from '../../../../utils/format.helper';
// import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class MyTFarePaymentHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };



    res.render('history/myt-fare.payment.history.html', {
      svcInfo: svcInfo,
      currentString: this.getKorStringWithQuery(query.current) || MYT_FARE_PAYMENT_HISTORY_TYPE.all,
      data: {
        current: (query.current === 'payment' || query.current === '') ? 'all' : query.current
      }
    });
  }

  private getKorStringWithQuery(current: string): any {
    return MYT_FARE_PAYMENT_HISTORY_TYPE[this.getKeyWithQuery(current)];
  }

  private getKeyWithQuery(queryString: string): any {
    return queryString.split('').filter((elem, idx, arr) => {
      if (elem === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
        return '';
      }
      return elem;
    }).join('');
  }
}

export default MyTFarePaymentHistory;
