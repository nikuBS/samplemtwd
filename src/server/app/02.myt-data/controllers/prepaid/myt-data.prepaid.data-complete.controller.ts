/**
 * FileName: myt-data.prepaid.data-complete.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.28
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {DATA_UNIT, MYT_DATA_COMPLETE_MSG} from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import {RECHARGE_DATA_CODE} from '../../../../types/bff.type';

class MyTDataPrepaidDataComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('prepaid/myt-data.prepaid.data-complete.html', Object.assign(this._getData(queryObject), { pageInfo }));
  }

  private _getData(queryObject: any): any {
    const type = queryObject.type;
    return {
      type: type,
      mainTitle: this._getMainTitle(type),
      description: MYT_DATA_COMPLETE_MSG.DESCRIPTION,
      data: this._getDataInfo(queryObject, type),
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
    } else if (type === 'cancel') {
      mainTitle = MYT_DATA_COMPLETE_MSG.DATA_RECHARGE_CANCEL;
    }
    return mainTitle;
  }

  private _getDataInfo(queryObject: any, type: string): string {
    let data = queryObject.data;
    if (data !== undefined) {
      if (type === undefined) {
        data = data + DATA_UNIT.GB;
      } else {
        data = RECHARGE_DATA_CODE[data];
      }
    }
    return data;
  }
}

export default MyTDataPrepaidDataComplete;
