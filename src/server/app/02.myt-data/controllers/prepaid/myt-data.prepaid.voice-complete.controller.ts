/**
 * FileName: myt-data.prepaid.voice-complete.controller.ts
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { MYT_DATA_COMPLETE_MSG } from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaidVoiceComplete extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const queryObject: any = ParamsHelper.getQueryParams(req.url);
    const response = Object.assign(
      { pageInfo },
      queryObject,
      this.makeResponseParams(queryObject),
      {
        convertAmount: this.convertAmount,
        convertDate: this.convertDate
      }
    );

    res.render('prepaid/myt-data.prepaid.voice-complete.html', response);
  }

  private makeResponseParams = (queryObject) => {
    let mainTitle = MYT_DATA_COMPLETE_MSG.VOICE_RECHARGE;

    if ( queryObject.type === 'auto' ) {
      mainTitle = MYT_DATA_COMPLETE_MSG.VOICE_RECHARGE_AUTO;
    }

    if ( queryObject.type === 'change' ) {
      mainTitle = MYT_DATA_COMPLETE_MSG.VOICE_RECHARGE_CHANGE;
    }

    if ( queryObject.type === 'cancel' ) {
      mainTitle = MYT_DATA_COMPLETE_MSG.VOICE_RECHARGE_CANCEL;
    }

    return {
      mainTitle: mainTitle,
      centerName: MYT_DATA_COMPLETE_MSG.HISTORY,
      centerUrl: '/myt-data/recharge/prepaid/history',
      confirmUrl: '/myt-data/submain'
    };
  }

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoiceComplete;
