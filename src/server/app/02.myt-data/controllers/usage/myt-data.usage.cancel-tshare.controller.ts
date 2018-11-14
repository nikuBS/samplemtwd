/**
 * FileName: myt-data.usage.cancel-tshare.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.12
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_USAGE_CANCEL_TSHARE } from '../../../../types/string.type';

class MyTDataUsageCancelTshare extends TwViewController {
  private _VIEW = {
    DEFAULT: 'usage/myt-data.usage.cancel-tshare.html'
  };

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const cSvcMgmtNum = req.query.cSvcMgmtNum;
    Observable.combineLatest(
      this.reqTDataSharings()
    ).subscribe(([tDataSharingsResp]) => {
      const apiError = this.error.apiError([
        tDataSharingsResp
      ]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.renderErr(res, apiError, svcInfo);
      }

      const tDataSharingsResult = this.getResult(tDataSharingsResp);
      const child = this.getChild(tDataSharingsResult.childList, cSvcMgmtNum)[0];

      const options = {
        child,
        svcInfo,
        pageInfo
      };

      res.render(this._VIEW.DEFAULT, options);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
  }

  private reqTDataSharings(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0005, {});
  }

  private getChild(children: any, cSvcMgmtNum: string): any {
    return children.filter((child) => {
      return child.cSvcMgmtNum === cSvcMgmtNum;
    });
  }

  private getResult(resp: any): any {
    return resp.result;
  }

  private renderErr(res, err, svcInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_CANCEL_TSHARE.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo
    });
  }
}

export default MyTDataUsageCancelTshare;
