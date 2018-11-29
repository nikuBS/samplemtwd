/**
 * FileName: myt-data.prepaid.data-complete.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.28
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import {DATA_UNIT, MYT_DATA_COMPLETE_MSG} from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';

class MyTDataPrepaidDataComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('prepaid/myt-data.prepaid.data-complete.html', this._getData(queryObject));
  }

  private _getData(queryObject: any): any {
    return {
      mainTitle: MYT_DATA_COMPLETE_MSG.DATA_RECHARGE,
      description: '',
      txt: MYT_DATA_COMPLETE_MSG.AFTER_DATA,
      data: queryObject.data + DATA_UNIT.GB,
      centerName: MYT_DATA_COMPLETE_MSG.HISTORY,
      centerUrl: '/myt-data/recharge/prepaid/history',
      confirmUrl: '/myt-data/submain'
    };
  }
}

export default MyTDataPrepaidDataComplete;
