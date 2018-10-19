/**
 * FileName: customer.useguide.site.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.10.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

// import {Observable} from 'rxjs/Observable';
// import {MYT_FARE_PAYMENT_HISTORY_TYPE, MYT_FARE_PAYMENT_NAME} from '../../../../types/string.type';
// import {MYT_PAYMENT_HISTORY_DIRECT_PAY_TYPE, MYT_PAYMENT_HISTORY_REFUND_TYPE,
//   MYT_PAYMENT_HISTORY_AUTO_UNITED_TYPE, MYT_PAYMENT_HISTORY_AUTO_TYPE} from '../../../../types/bff.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class CustomerUseguideSiteUseguide extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    res.render('useguide/customer.useguide.site.html', {svcInfo: svcInfo, data: {}});
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

export default CustomerUseguideSiteUseguide;
