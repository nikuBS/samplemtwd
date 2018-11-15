/**
 * FileName: myt-data.prepaid.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.11.14
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTDataPrepaid extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req)
    };

    switch ( page ) {
      case 'voice':
        this.getPPSInfo().subscribe((result) => {
          res.render(
            'prepaid/myt-data.prepaid.voice.html',
            Object.assign(responseData,
              {
                PPSInfo: result,
                convertDate: this.convertDate,
                convertAmount: this.convertAmount
              }
            )
          );
        });
        break;
      case 'data':
        res.render('prepaid/myt-data.prepaid.data.html', responseData);
        break;
      default:
      // Observable.combineLatest(
      //   this.getLimitUserInfo()
      // ).subscribe(([limitUserInfo]) => {
      //   const response = Object.assign(
      //     { limitUserInfo: limitUserInfo },
      //     responseData
      //   );
      //
      //   if ( limitUserInfo ) {
      //     res.render('limit/myt-data.limit.html', response);
      //   } else {
      //     res.render('limit/myt-data.limit.error.html', response);
      //   }
      // });
    }
  }

  public getPPSInfo = () => this.apiService
    .request(API_CMD.BFF_05_0013, {})
    .map((res) => {
      // if ( res.code === API_CODE.CODE_00 ) {
      //   return res.result;
      // } else {
      //   return null;
      // }
      return {
        'prodAmt': '50000',
        'remained': '100',
        'obEndDt': '20190820',
        'inbEndDt': '20190830',
        'numEndDt': '20210421',
        'dataYn': 'Y',
        'dataOnlyYn': 'N'
      };
    })

  public convertDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaid;
