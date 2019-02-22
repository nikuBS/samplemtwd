/**
 * FileName: myt-data.prepaid.data-auto.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.29
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {DATA_UNIT, MYT_DATA_RECHARGE_MSG} from '../../../../types/string.type';
import {RECHARGE_DATA_CODE} from '../../../../types/bff.type';
import {Observable} from 'rxjs/Observable';

class MyTDataPrepaidDataAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) {
      Observable.combineLatest(
        this.getPPSInfo(),
        this.getAutoInfo()
      ).subscribe(([ppsInfo, autoInfo]) => {
        if (ppsInfo.code === API_CODE.CODE_00 && autoInfo.code === API_CODE.CODE_00) {
          const ppsResult = ppsInfo.result;
          const autoResult = autoInfo.result;

          res.render('prepaid/myt-data.prepaid.data-auto.html', {
            ppsInfo: this.parseData(ppsResult),
            autoInfo: this.parseAuto(autoResult),
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            isApp: BrowserHelper.isApp(req)
          });
        } else {
          this.error.render(res, {
            code: ppsInfo.code === API_CODE.CODE_00 ? autoInfo.code : ppsInfo.code,
            msg: ppsInfo.code === API_CODE.CODE_00 ? autoInfo.msg : ppsInfo.msg,
            svcInfo: svcInfo
          });
        }
      });
    } else {
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  private getPPSInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0013, {});
  }

  private getAutoInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0060, {});
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result.remained)) {
      result.dataObj = FormatHelper.customDataFormat(result.remained, DATA_UNIT.KB, DATA_UNIT.MB);
      result.dataObj.dataValue = result.dataObj.data.replace(',', '');
    } else {
      result.dataObj.data = 0;
      result.dataObj.dataValue = 0;
    }
    result.fromDate = DateHelper.getShortDate(result.obEndDt);
    result.toDate = DateHelper.getShortDate(result.inbEndDt);
    result.remainDate = DateHelper.getShortDate(result.numEndDt);

    return result;
  }

  private parseAuto(result: any): any {
    if (FormatHelper.isEmpty(result.amtCd)) {
      result.txt = MYT_DATA_RECHARGE_MSG.SELECT_DATA;
      result.id = undefined;
      result.isAuto = false;
      result.btnText = MYT_DATA_RECHARGE_MSG.REGISTER;
    } else {
      result.txt = RECHARGE_DATA_CODE[result.amtCd];
      result.id = result.amtCd;
      result.isAuto = true;
      result.btnText = MYT_DATA_RECHARGE_MSG.CHANGE;
    }
    return result;
  }
}

export default MyTDataPrepaidDataAuto;
