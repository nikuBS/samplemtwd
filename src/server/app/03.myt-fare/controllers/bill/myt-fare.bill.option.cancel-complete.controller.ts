/**
 * @file myt-fare.bill.option.cancel-complete.controller.ts
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.12.17
 * Description: 자동납부 해지 완료
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import ParamsHelper from '../../../../utils/params.helper';

class MyTFareBillOptionCancelComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('bill/myt-fare.bill.option.cancel-complete.html', this._getData(queryObject));
  }

  private _getData(queryObject: any): any {
    const data = {
      isSms: false,
      num: ''
    };

    if (queryObject !== null) {
      const isSms = queryObject['isSms'];
      if (isSms === 'Y') {
        data.isSms = true;
        data.num = queryObject['num'];
      }
    }
    return data;
  }
}

export default MyTFareBillOptionCancelComplete;
