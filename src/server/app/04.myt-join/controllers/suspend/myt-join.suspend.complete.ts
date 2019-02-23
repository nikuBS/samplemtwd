/**
 * FileName: myt-join.suspend.complete.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2019. 1. 29.
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_SUSPEND_COMPLETE_MSG } from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinSuspendComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject: any = ParamsHelper.getQueryParams(req.url);
    const data = this._setParam(queryObject);
    res.render('suspend/myt-join.suspend.complete.html', { data, pageInfo });
  }

  private _setParam = (params) => {
    const data = { confirmUrl: '/myt-join/submain' };
    let duration = '';
    switch ( params.command ) {
      case 'longterm':
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.APPLY;
        data['centerUrl'] = '/myt-join/submain/suspend/status';
        data['centerName'] = MYT_SUSPEND_COMPLETE_MSG.GO_TO_STATUS;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.MM.DD.') + '~' +
          DateHelper.getShortDateWithFormat(params.toDt, 'YYYY.MM.DD.');
        data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_LONG_TERM_SUSPEND_MESSAGE_SVC
          .replace('{DURATION}', duration)
          .replace('{SVC_INFO}', FormatHelper.conTelFormatWithDash(params.svcNum));
        break;

      case 'resuspend':
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.RESUSPEND;
        data['centerUrl'] = '/myt-join/submain/suspend/status';
        data['centerName'] = MYT_SUSPEND_COMPLETE_MSG.GO_TO_STATUS;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.MM.DD.') + '~' +
          DateHelper.getShortDateWithFormat(params.toDt, 'YYYY.MM.DD.');
        data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_RESUSPEND_MESSAGE.replace('{DURATION}', duration)
          .replace('{SVC_NUMBER}', FormatHelper.conTelFormatWithDash(params.svcNum));
        break;

      case 'cancel-resuspend':
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.CANCEL_RESUSPEND;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.MM.DD.');
        break;

      case 'reset':
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.RESET;
        break;

      case 'temporary':
        data['mainTitle'] = MYT_SUSPEND_COMPLETE_MSG.APPLY;
        duration = DateHelper.getShortDateWithFormat(params.fromDt, 'YYYY.MM.DD.') + '~' +
          DateHelper.getShortDateWithFormat(params.toDt, 'YYYY.MM.DD.');
        const type = params.icallPhbYn === 'Y' ?
          MYT_SUSPEND_COMPLETE_MSG.TYPE.ALL : MYT_SUSPEND_COMPLETE_MSG.TYPE.CALL;
        data['desc'] = MYT_SUSPEND_COMPLETE_MSG.SUCCESS_SUSPEND_MESSAGE.replace('{DURATION}', duration)
          .replace('{SUSPEND_TYPE}', type);
        break;
    }
    return data;
  }
}

export default MyTJoinSuspendComplete;
