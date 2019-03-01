/**
 * FileName: myt-fare.bill.pay-complete.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.27
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_COMPLETE_MSG} from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';

class MyTFareBillPayComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject = ParamsHelper.getQueryParams(req.url);
    res.render('bill/myt-fare.bill.pay-complete.html', Object.assign(this._getData(queryObject), { pageInfo }));
  }

  private _getData(queryObject: any): any {
    let data = {
      mainTitle: MYT_FARE_COMPLETE_MSG.PAYMENT,
      subTitle: '',
      description: '',
      centerName: MYT_FARE_COMPLETE_MSG.HISTORY,
      centerUrl: '/myt-fare/info/history',
      confirmUrl: '/myt-fare/submain'
    };

    if (queryObject !== null) {
      const type = queryObject['type'];
      if (type === 'sms') {
        data = this._getSmsData(queryObject, data);
      } else if (type === 'small' || type === 'contents') {
        const subType = queryObject['sub'];
        if (FormatHelper.isEmpty(subType)) {
          data = this._getPrepayData(data, type);
        } else {
          data = this._getAutoPrepayData(data, type, subType);
        }
      }
    }
    return data;
  }

  private _getSmsData(queryObject: any, data: any): any {
    const svcNum = queryObject['svcNum'];
    data.mainTitle = MYT_FARE_COMPLETE_MSG.SMS;
    data.subTitle = FormatHelper.isEmpty(svcNum) ? '' : svcNum + ' ' + MYT_FARE_COMPLETE_MSG.NUMBER;
    data.description = MYT_FARE_COMPLETE_MSG.SMS_DESCRIPTION;
    data.centerName = '';

    return data;
  }

  private _getPrepayData(data: any, type: any): any {
    data.mainTitle = MYT_FARE_COMPLETE_MSG.PREPAY;
    data.centerName = MYT_FARE_COMPLETE_MSG.PREPAY_HISTORY;
    if (type === 'small') {
      data.centerUrl += '?sortType=micro-prepay';
    } else {
      data.centerUrl += '?sortType=content-prepay';
    }
    data.confirmUrl = '/myt-fare/bill/' + type;

    return data;
  }

  private _getAutoPrepayData(data: any, type: any, subType: any): any {
    if (subType === 'auto') {
      data.mainTitle = MYT_FARE_COMPLETE_MSG.REGISTER;
      data.centerName = '';
    } else {
      if (subType === 'cancel') {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CANCEL;
      } else {
        data.mainTitle = MYT_FARE_COMPLETE_MSG.CHANGE;
      }
      data.centerName = MYT_FARE_COMPLETE_MSG.CHANGE_HISTORY;
      data.centerUrl = '/myt-fare/bill/' + type + '/auto/info';
    }
    data.confirmUrl = '/myt-fare/bill/' + type;

    return data;
  }
}

export default MyTFareBillPayComplete;
