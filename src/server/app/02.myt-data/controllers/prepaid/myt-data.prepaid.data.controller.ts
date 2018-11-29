/**
 * FileName: myt-data.prepaid.data.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {DATA_UNIT} from '../../../../types/string.type';
import PrepaidDataInfo from '../../../../mock/server/data/myt-fare.data.prepaid.data.mock';
import {Observable} from 'rxjs/Observable';

class MyTDataPrepaidData extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.getPPSInfo().subscribe((resp) => {
      if (resp.code !== API_CODE.CODE_00) {
        // const result = resp.result;
        const result = PrepaidDataInfo.result;
        res.render('prepaid/myt-data.prepaid.data.html', {
          ppsInfo: this.parseData(result),
          svcInfo: svcInfo,
          isApp: BrowserHelper.isApp(req)
        });
      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getPPSInfo(): any {
    return this.apiService.request(API_CMD.BFF_05_0013, {});
  }

  private parseData(result: any): any {
    result.dataObj = FormatHelper.customDataFormat(result.remained, DATA_UNIT.KB, DATA_UNIT.MB);
    result.dataObj.dataValue = result.dataObj.data.replace(',', '');
    result.fromDate = DateHelper.getShortDate(result.obEndDt);
    result.toDate = DateHelper.getShortDate(result.inbEndDt);
    result.remainDate = DateHelper.getShortDate(result.numEndDt);

    return result;
  }
}

export default MyTDataPrepaidData;
