/**
 * FileName: myt-join.wire.modify.period.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.16
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_JOIN_WIRE_MODIFY_PERIOD } from '../../../../types/string.type';

class MyTJoinWireModifyPeriod extends TwViewController {
  private _VIEW: any = {
    DEFAULT: 'wire/myt-join.wire.modify.period.html'
  };

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
      return this.renderErr(res, {}, svcInfo);
    }

    Observable.combineLatest(
      this.reqWireAgreementsInfo()
    ).subscribe(([wireAgreementsInfoResp]) => {
      const apiError = this.error.apiError([
        wireAgreementsInfoResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo);
      }

      const wireAgreementsInfo = this.getWireAgreementsInfo(wireAgreementsInfoResp);
      // console.log('~~~~~~~~~~~~~~``wireAgreementsInfo', wireAgreementsInfo);

      const options = {
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {},
        wireAgreementsInfo: wireAgreementsInfo || {}
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo);
    });
  }

  private reqWireAgreementsInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0140, {});
  }

  private getWireAgreementsInfo(resp: any): any {
    const wireAgreementsInfo = resp.result;
    // wireAgreementsInfo.beforeTerm = '2년';
    // wireAgreementsInfo.smartDirectYn = 'Y';
    // wireAgreementsInfo.grpProdYn = 'Y';
    return wireAgreementsInfo;
  }

  private renderErr(res, err, svcInfo): any {
    return this.error.render(res, {
      title: MYT_JOIN_WIRE_MODIFY_PERIOD.TITLE,
      code: err.code,
      msg: err.msg,
      svcInfo
    });
  }

}

export default MyTJoinWireModifyPeriod;
