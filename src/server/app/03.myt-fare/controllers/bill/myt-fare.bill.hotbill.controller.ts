/**
 * @file myt-fare.bill.hotbill.ts
 * @author Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since 2018. 9. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { LINE_NAME } from '../../../../types/bff.type';
import StringHelper from '../../../../utils/string.helper';
import { MYT_FARE_HOTBILL_TITLE } from '../../../../types/title.type';
import { Observable } from 'rxjs/Observable';
import { delay, mergeMap } from 'rxjs/operators';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import FormatHelper from '../../../../utils/format.helper';

class MyTFareBillHotbill extends TwViewController {
  _svcInfo: any;
  _preBillAvailable: boolean = true;
  _isPrev: boolean = false;
  _blockOnFirstDay = false; // 매월 1일 조회 불가 여부

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    this._svcInfo = svcInfo;
    this._isPrev = req.url.endsWith('/prev');

    if ( !req.query.child && new Date().getDate() > 7 ) { // 전월요금 7일까지 보이기
      this._preBillAvailable = false;
    }
    // 당월 요금은 2일부터 조회 가능(매월 1일은 안내 매세지 출력) -> [DV001-19501]가능하게 수정
    if ( this._blockOnFirstDay && new Date().getDate() === 1 && !this._isPrev) {
      res.render('bill/myt-fare.bill.hotbill.html', {
        svcInfo,
        pageInfo,
        lines: [],
        billAvailable: false,
        title: MYT_FARE_HOTBILL_TITLE.MAIN,
        preBillAvailable: this._preBillAvailable,
        isPrev:  this._isPrev
      });
    } else {
      // 자녀 or 본인 전월 실시간 요금
      const svcs = this._getServiceInfo(svcInfo, childInfo, allSvc);
      if ( !this._isPrev && !req.query.child && svcs && svcs.length > 0 ) {
        res.render('bill/myt-fare.bill.hotbill.html', {
          svcInfo,
          pageInfo,
          lines: svcs,
          billAvailable: true,
          preBillAvailable: this._preBillAvailable,
          title: MYT_FARE_HOTBILL_TITLE.MAIN,
          isPrev:  this._isPrev
        });

        // 다른 회선도 JS에서 API처리로 변경(아래 주석 처리)
        /*
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
            return this.error.render(res, {
              title: MYT_FARE_HOTBILL_TITLE.MAIN,
              msg: err.message,
              pageInfo: pageInfo,
              svcInfo: svcInfo
            });
          },
          () => {
            res.render('bill/myt-fare.bill.hotbill.html', {
              svcInfo,
              pageInfo,
              lines: svcs,
              billAvailable: true,
              preBillAvailable: this._preBillAvailable,
              title: MYT_FARE_HOTBILL_TITLE.MAIN,
              isPrev:  this._isPrev
            });
          });
          */
      } else {
        // 본인 당월 실시간 요금
        const options = {
          svcInfo,
          pageInfo,
          lines: [],
          billAvailable: true,
          isPrev:  this._isPrev
        };

        if ( this._isPrev ) {
          options['title'] = MYT_FARE_HOTBILL_TITLE.PREV;
          options['preBillAvailable'] =  false;
        } else if ( req.query.child ) {
          const child = childInfo.find(svc => svc.svcMgmtNum === req.query.child);
          options['title'] = MYT_FARE_HOTBILL_TITLE.CHILD;
          options['child'] = StringHelper.phoneStringToDash(child.svcNum);
          options['childProdNm'] = StringHelper.phoneStringToDash(child.prodNm);
          options['childProdId'] = child.prodId;
          options['preBillAvailable'] =  false;
        } else {
          options['title'] = MYT_FARE_HOTBILL_TITLE.MAIN;
          options['preBillAvailable'] =  this._preBillAvailable;
        }
        res.render('bill/myt-fare.bill.hotbill.html', options);
      }
    }
  }

  /**
   * 본의의 선택회선 외 회선과 자녀회선의 실시간 요금은 노드에서 요청한다.
   * @param svcInfo
   * @param childInfo
   * @param allSvc
   * @private
   */
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
          ( svc.svcMgmtNum !== svcInfo['svcMgmtNum'])));
    }
    return svcs.map(svc => {
      svc.clsNm =  [ 'M3', 'M4'].indexOf(svc.svcAttrCd) > -1 ? 'tablet' : 'cellphone';
      svc.svcDashedNum = FormatHelper.conTelFormatWithDash(svc.svcNum);
      return JSON.parse(JSON.stringify(svc));
    });
  }

  /**
   * 실시간 사용요금 생성 요청을 보낸다.(BFF_05_0022 count:0 일 때 생성 요청)
   * @param svc
   * @private
   */
  private _requestHotbillInfo(svc): Observable<any> {
    const self = this;
    const params = { count: 0 };
    const headers: {} = {};
    params['childSvcMgmtNum'] = svc['svcMgmtNum'];

    return self.apiService.request(API_CMD.BFF_05_0022, params, headers)
      .pipe(
        delay(2500), // 요청 후 2.5초 후 조회
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

  /**
   * 요청한 실시간 사용요금을 조회한다.(BFF_05_0022 count:1,2 일 때 조회)
   * @param svc
   * @param isRetry
   * @private
   */
  private _getBillResponse(svc: object, isRetry: boolean): Observable<any> {
    const self = this;
    const params = { count: !isRetry ? 1 : 2 };
    const headers: {} = {};
    params['childSvcMgmtNum'] = svc['svcMgmtNum'];
    return self.apiService.request(API_CMD.BFF_05_0022, params, headers)
      .map(resp => {
        if ( resp.code !== '00' ) {
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
