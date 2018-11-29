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
    const type = queryObject.type;
    return {
      type: type,
      mainTitle: this._getMainTitle(type),
      description: MYT_DATA_COMPLETE_MSG.DESCRIPTION,
      data: queryObject.data + DATA_UNIT.GB,
      centerName: MYT_DATA_COMPLETE_MSG.HISTORY,
      centerUrl: '/myt-data/recharge/prepaid/history',
      confirmUrl: '/myt-data/submain'
    };
  }

  private _getMainTitle(type: string): string {
    let mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE;
    if (type === 'auto') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_AUTO;
    } else if (type === 'change') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_CHANGE;
    }
    return mainTitle;
  }
}

export default MyTDataPrepaidDataComplete;
