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
import StringHelper from '../../../../utils/string.helper';
import { MYT_FARE_HOTBILL_TITLE } from '../../../../types/title.type';
import { Observable } from 'rxjs/Observable';
import { mergeMap, delay } from 'rxjs/operators';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

class MyTFareBillHotbill extends TwViewController {
  _svcInfo: any;
  _preBillAvailable: boolean = true;
  _isPrev: boolean = false;

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    this._svcInfo = svcInfo;
    if ( !req.query.child && new Date().getDate() > 7 ) { // 전월요금 7일까지 보이기
      this._preBillAvailable = false;
    }
    // debuging
    this._preBillAvailable = true;

    // 2일부터 조회 가능
    if ( new Date().getDate() === 1 ) {
      res.render('bill/myt-fare.bill.hotbill.html', {
        svcInfo,
        pageInfo,
        lines: [],
        billAvailable: false
      });
    } else {
      let svcs = this._getServiceInfo(svcInfo, childInfo, allSvc);
      let preAmount = '0';
      this._isPrev = req.url.endsWith('/prev');
      if ( !this._isPrev && !req.query.child && svcs && svcs.length > 0 ) {
        let preBill: any;
        Observable.from(svcs)
          .pipe(
            mergeMap(svc => this._requestHotbillInfo(svc))
          ).subscribe(
          data => {
            if ( data ) {
              data.svc.svcNum = FormatHelper.conTelFormatWithDash(data.svc.svcNum);
              data.svc.bill = data.resp.result.hotBillInfo[0].totOpenBal2;
              if ( this._preBillAvailable && data.svc.svcMgmtNum === this._svcInfo.svcMgmtNum ) {
                data.previous = true;
                preAmount = data.resp.result.hotBillInfo[0].totOpenBal1;
                preBill = data.resp.result.hotBillInfo[0];
                // preAmount = preAmount.replace(/,/g, '');
                data.svc.preBill = true;
              }
            }
          },
          err => {
            return this.error.render(res, {
              title: MYT_FARE_HOTBILL_TITLE.MAIN,
              msg: err.message,
              svcInfo: svcInfo
            });
          },
          () => {
            if ( this._preBillAvailable ) {
              svcs = svcs.filter((svc) => {
                return svc.svcMgmtNum !== svcInfo['svcMgmtNum'];
              });
            }

            res.render('bill/myt-fare.bill.hotbill.html', {
              svcInfo,
              pageInfo,
              lines: svcs,
              billAvailable: true,
              preAmount: preAmount,
              preBill: preBill
            });
          });
      } else {
        const options = {
          svcInfo: svcInfo,
          pageInfo,
          lines: [],
          billAvailable: true,
          preAmount: preAmount,
          preBill: null
        };

        if ( this._isPrev ) {
          options['isPrev'] = 'true';
          options['title'] = MYT_FARE_HOTBILL_TITLE.PREV;
        } else if ( req.query.child ) {
          const child = childInfo.find(svc => svc.svcMgmtNum === req.query.child);
          options['title'] = MYT_FARE_HOTBILL_TITLE.CHILD;
          options['child'] = StringHelper.phoneStringToDash(child.svcNum);
        } else {
          options['title'] = MYT_FARE_HOTBILL_TITLE.MAIN;
        }
        res.render('bill/myt-fare.bill.hotbill.html', options);
      }
    }
  }

  private _getServiceInfo(svcInfo, childInfo, allSvc): any[] {
    let svcs = childInfo || [];
    svcs.map(svc => {
      svc.child = true;
      return svc;
    });

    const otherSvc = allSvc || [];
    if ( otherSvc && otherSvc[LINE_NAME.MOBILE] ) {
      svcs = svcs.concat(otherSvc[LINE_NAME.MOBILE]
        .filter(svc => (['M1', 'M3'].indexOf(svc.svcAttrCd) > -1) &&  // 지원 회선 필터링
          (this._preBillAvailable || svc.svcMgmtNum !== svcInfo['svcMgmtNum']))); // 전월요금 필요할 경우 본인 회선도 조회(gubun: Q)
    }

    return svcs.map(svc => {
      return JSON.parse(JSON.stringify(svc));
    });
  }

  private _requestHotbillInfo(svc): Observable<any> {
    const self = this;
    const params = { count: 0 };
    const headers: {} = {};
    if ( this._isPrev ) {
      params['gubun'] = 'Q';
    } else if ( svc['child'] ) {
      params['childSvcMgmtNum'] = svc['svcMgmtNum'];
    } else if ( this._preBillAvailable && svc['svcMgmtNum'] === this._svcInfo.svcMgmtNum ) { // 전월요금 조회
      params['gubun'] = 'Q';
    }
    // else {
    //   headers['T-SvcMgmtNum'] = parseInt(svc['svcMgmtNum'], 10);
    // }
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
    if ( this._isPrev ) {
      params['gubun'] = 'Q';
    } else if ( svc['child'] ) {
      params['childSvcMgmtNum'] = svc['svcMgmtNum'];
    } else if ( this._preBillAvailable && svc['svcMgmtNum'] === this._svcInfo.svcMgmtNum ) { // 전월요금 조회
      params['gubun'] = 'Q';
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
            throw Error(MYT_FARE_HOTBILL_TITLE.ERROR.BIL0063);
          }

          // catch block 에서 retry 시도
          throw Error('Retry again');
        }
        return { resp, svc };
      });
  }
}

export default MyTFareBillHotbill;
