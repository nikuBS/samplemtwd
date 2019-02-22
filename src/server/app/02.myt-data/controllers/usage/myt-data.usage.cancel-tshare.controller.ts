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
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const tDataSharingsResult = this.getResult(tDataSharingsResp);
      const child = this.getChild(tDataSharingsResult.childList, cSvcMgmtNum)[0];
      const showSvcNum = FormatHelper.conTelFormatWithDash(svcInfo.svcNum);
      const showUsimNum = this.convUsimFormat(child.usimNum);

      const options = {
        child,
        svcInfo,
        pageInfo,
        showSvcNum,
        showUsimNum
      };

      res.render(this._VIEW.DEFAULT, options);

    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
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

  private convUsimFormat(v: any): any {
    if ( !v || v.replace(/-/g).trim().length < 14 ) {
      return v || '';
    }
    let ret = v.replace(/-/g).trim();
    ret = ret.substr(0, 4) + '-' + ret.substr(4, 4) + '-' + ret.substr(8, 4) + '-' + ret.substr(12, 2);
    return ret;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    return this.error.render(res, {
      title: MYT_DATA_USAGE_CANCEL_TSHARE.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo: pageInfo,
      svcInfo
    });
  }
}

export default MyTDataUsageCancelTshare;
