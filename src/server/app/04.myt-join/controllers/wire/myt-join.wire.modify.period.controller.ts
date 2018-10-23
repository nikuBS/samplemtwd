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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
      return this.error.render(res, {
        title: MYT_JOIN_WIRE_MODIFY_PERIOD.TITLE,
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this.reqWireAgreementsInfo()
    ).subscribe(([wireAgreementsInfoResp]) => {
      const apiError = this.error.apiError([
        wireAgreementsInfoResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return res.render('error.server-error.html', {
          title: MYT_JOIN_WIRE_MODIFY_PERIOD.TITLE,
          code: apiError.code,
          msg: apiError.msg,
          svcInfo: svcInfo
        });
      }

      const wireAgreementsInfo = this.getWireAgreementsInfo(wireAgreementsInfoResp);
      // console.log('~~~~~~~~~~~~~~``wireAgreementsInfo', wireAgreementsInfo);

      const options = {
        svcInfo: svcInfo || {},
        wireAgreementsInfo: wireAgreementsInfo || {}
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return res.render('error.server-error.html', {
        title: MYT_JOIN_WIRE_MODIFY_PERIOD.TITLE,
        code: resp.code,
        msg: resp.msg,
        svcInfo: svcInfo
      });
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

}

export default MyTJoinWireModifyPeriod;
