/**
 * FileName: myt-data.usage.child.recharge.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import {MYT_DATA_CHILD_USAGE } from '../../../../types/string.type';

class MytDataUsageChildRecharge extends TwViewController {
  private childSvcMgmtNum;
  private _VIEW = {
    DEFAULT: 'usage/myt-data.usage.child.recharge.html'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.childSvcMgmtNum = req.query.childSvcMgmtNum;
    if ( FormatHelper.isEmpty(this.childSvcMgmtNum) ) {
      return this.renderErr(res, svcInfo, {});
    }
    Observable.combineLatest(
      this.reqTingSubscriptions()
    ).subscribe(([tingSubscriptionsResp]) => {
      const apiError = this.error.apiError([
        tingSubscriptionsResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo);
      }

      const tingSubscriptions = this.getTingSubscriptions(tingSubscriptionsResp);

      const options = {
        svcInfo,
        pageInfo,
        tingSubscriptions,
        childSvcMgmtNum: this.childSvcMgmtNum
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
  }

  private reqTingSubscriptions(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0028, {
      childSvcMgmtNum: this.childSvcMgmtNum
    });
  }

  private getTingSubscriptions(resp: any): any {
    const result = resp.result;
    result.showTopUpLimit = FormatHelper.addComma(result.topUpLimit);
    return result;
  }

  private renderErr(res, svcInfo, err): any {
    const option = {
      title: MYT_DATA_CHILD_USAGE.TITLE,
      svcInfo
    };
    if ( err ) {
      Object.assign(option, err);
    }
    return this.error.render(res, option);
  }
}

export default MytDataUsageChildRecharge;
