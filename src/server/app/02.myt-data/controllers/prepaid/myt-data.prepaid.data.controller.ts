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
import {Observable} from 'rxjs/Observable';

class MyTDataPrepaidData extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) {
      Observable.combineLatest(
        this.getPPSInfo(),
        this.getEmailAddress()
      ).subscribe(([ppsInfo, email]) => {
        if (ppsInfo.code === API_CODE.CODE_00) {
          const result = ppsInfo.result;
          res.render('prepaid/myt-data.prepaid.data.html', {
            ppsInfo: this.parseData(result),
            emailAddress: this.parseMail(email),
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            isApp: BrowserHelper.isApp(req)
          });
        } else {
          this.error.render(res, {
            code: ppsInfo.code,
            msg: ppsInfo.msg,
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

  private getEmailAddress(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_01_0061, {});
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

  private parseMail(email: any): any {
    if (email.code === API_CODE.CODE_00) {
      return email.result.email;
    }
    return '';
  }
}

export default MyTDataPrepaidData;
