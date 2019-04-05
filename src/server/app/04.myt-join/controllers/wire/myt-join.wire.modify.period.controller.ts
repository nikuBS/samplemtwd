/**
 * MenuName: 나의가입정보(인터넷/집전화/IPTV) > 약정기간 변경
 * FileName: myt-join.wire.modify.period.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.10.16
 * Summary: 유선 약정기간 정보 조회
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
    Observable.combineLatest(
      this.reqWireAgreementsInfo()
    ).subscribe(([wireAgreementsInfoResp]) => {
      const apiError = this.error.apiError([
        wireAgreementsInfoResp
      ]);

      if ( !FormatHelper.isEmpty(apiError) ) {
        return this.renderErr(res, apiError, svcInfo, pageInfo);
      }

      const wireAgreementsInfo = this.getWireAgreementsInfo(wireAgreementsInfoResp);
      // console.log('~~~~~~~~~~~~~~``wireAgreementsInfo', wireAgreementsInfo);

      const options = {
        svcInfo: svcInfo || {},
        pageInfo: pageInfo || {},
        wireAgreementsInfo: wireAgreementsInfo || {},
        isBroadbandJoined: 'N'
      };

      res.render(this._VIEW.DEFAULT, options);
    }, (resp) => {
      return this.renderErr(res, resp, svcInfo, pageInfo);
    });
  }

  /**
   * 인터넷/집전화/IPTV > 유선 약정정보조회
   * @private
   * return Observable
   */
  private reqWireAgreementsInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0140, {});
    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': 'MOD0014',
    //       'msg': '오류 입니다. {0},{1}',
    //       'traceId': 'a94a2b91d0094257',
    //       'spanId': 'a94a2b91d0094257',
    //       'clientDebugMessage': 'a94a2b91d0094257*',
    //       'hostname': 'TD3P026952',
    //       'appName': 'bff-spring-mobile',
    //       'debugMessage': '200 ',
    //       'orgSpanId': 'c17d941695ecfea5',
    //       'orgHostname': 'TD3P026952',
    //       'orgAppName': 'core-balance',
    //       'orgDebugMessage': 'BLN0002'
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(resp);
    //       observer.complete();
    //     } else {
    //       observer.error(resp);
    //     }
    //   }, 500);
    // });
  }

  /**
   * 약정정보조회 데이터 가공 후 반환
   * @param resp
   * @private
   * return wireAgreementsInfo{Object}
   */
  private getWireAgreementsInfo(resp: any): any {
    const wireAgreementsInfo = resp.result;
    // wireAgreementsInfo.beforeTerm = '2년';
    // wireAgreementsInfo.smartDirectYn = 'Y';
    // wireAgreementsInfo.grpProdYn = 'Y';
    return wireAgreementsInfo;
  }

  private renderErr(res, err, svcInfo, pageInfo): any {
    if (err.code === 'MOD0014') { // SK브로드밴드 가입자
      return res.render(this._VIEW.DEFAULT, {
        svcInfo,
        pageInfo,
        wireAgreementsInfo: {},
        isBroadbandJoined: 'Y'
      });
    }
    return this.error.render(res, {
      title: MYT_JOIN_WIRE_MODIFY_PERIOD.TITLE,
      code: err.code,
      msg: err.msg,
      pageInfo,
      svcInfo
    });
  }

}

export default MyTJoinWireModifyPeriod;
