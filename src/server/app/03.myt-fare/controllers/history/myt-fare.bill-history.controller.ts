/**
 * FileName: myt-fare.bill-history.controller.ts
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

class MyTFareBillHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    res.render('history/myt-fare.bill-history.html', {svcInfo: svcInfo, data: {
        isTax: query.current === 'tax',
        current: query.current
      }});
  }

}

export default MyTFareBillHistory;
