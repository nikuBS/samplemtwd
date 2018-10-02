/**
 * FileName: myt-fare.bill.hotbill.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 9. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { LINE_NAME } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { mergeMap, delay } from 'rxjs/operators';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import * as _ from 'underscore';

class MyTFareBillHotbill extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any) {
    // 2일부터 조회 가능
    if ( new Date().getDate() === 1 ) {
      res.render('bill/myt-fare.bill.hotbill.html', {
        svcInfo: svcInfo,
        lines: [],
        billAvailable : false
      });
    } else {
      const svcs = this._getServiceInfo(svcInfo);
      if ( !_.isEmpty(svcs) ) {
        const bills: any[] = [];
        Observable.from(svcs)
          .pipe(
            mergeMap(svc => this._requestHotbillInfo(svc))
          ).subscribe(
          data => {
            if ( data ) {
              data.svc.svcNum = FormatHelper.conTelFormatWithDash(data.svc.svcNum);
              data.svc.bill = data.resp.result.hotBillInfo[0].totOpenBal2;
            }
          },
          err => {
            console.log(err);
          },
          () => {
            res.render('bill/myt-fare.bill.hotbill.html', {
              svcInfo: svcInfo,
              lines: svcs,
              billAvailable: true
            });
          });
      } else {
        res.render('bill/myt-fare.bill.hotbill.html', {
          svcInfo: svcInfo,
          lines: [],
          billAvailable: true
        });
      }
    }
  }

  private _getServiceInfo(svcInfo): any[] {
    let svcs = this.loginService.getChildInfo() || [];
    svcs.map(svc => {
      svc.child = true;
      return svc;
    });

    const otherSvc = this.loginService.getAllSvcInfo() || [];
    if ( otherSvc && otherSvc[LINE_NAME.MOBILE] ) {
      svcs = svcs.concat(otherSvc[LINE_NAME.MOBILE].filter(svc => ['M1', 'M3'].indexOf(svc.svcAttrCd) > -1));
      _.reject(svcs, { svcMgmtNum: svcInfo['svcMgmtNum'] });
    }
    return _.map(svcs, _.clone);
  }

  private _requestHotbillInfo(svc): Observable<any> {
    const self = this;
    const params = { count: 0 };
    const headers: {} = {};
    if ( svc['child'] ) {
      params['childSvcMgmtNum'] = svc['svcMgmtNum'];
    } else {
      headers['T-SvcMgmtNum'] = parseInt(svc['svcMgmtNum'], 10);
    }
    return self.apiService.request(API_CMD.BFF_05_0022, params, headers)
      .pipe(
        delay(2500),
        mergeMap(res => {
            return self._getBillResponse(svc, false)
              .catch(error => {
                if ( error.message === 'Retry again' ) {
                  return self._getBillResponse(svc, true);
                } else {
                  throw Error(error.message);
                }
              });
          }
        )
      );
  }

  private _getBillResponse(svc: object, isRetry: boolean): Observable<any> {
    const self = this;
    const params = { count: !isRetry ? 1 : 2 };
    const headers: {} = {};
    if ( svc['child'] ) {
      params['childSvcMgmtNum'] = svc['svcMgmtNum'];
    } else {
      headers['T-SvcMgmtNum'] = parseInt(svc['svcMgmtNum'], 10);
    }
    return self.apiService.request(API_CMD.BFF_05_0022, params, headers)
      .map(resp => {
        if ( resp.code !== '00' ) {
          // TODO  여러 회선 중 하나만 애러 발생시 대처방안 확인
          // throw Error(`CODE ${resp.code} : ${resp.msg}`);
          return null;
        } else if ( !resp.result.hotBillInfo[0] || !resp.result.hotBillInfo[0].record1 ) {
          // 2번째 시도에도 fail이면 error 처리
          if ( isRetry ) {
            throw Error('The bill request is not completed.');
          }

          // catch block 에서 retry 시도
          throw Error('Retry again');
        }
        return { resp, svc };
      });
  }
}

export default MyTFareBillHotbill;
