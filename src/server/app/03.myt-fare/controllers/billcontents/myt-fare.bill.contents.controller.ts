/**
 * FileName: myt-fare.bill.contents.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.08
 * Description: 콘텐츠이용료 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';
import {PREPAY_ERR_MSG} from '../../../../types/string.type';

class MyTFareBillContents extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getContentsRemain() // 잔여한도 조회
    ).subscribe(([contentsRemain]) => {
      if (contentsRemain.code === API_CODE.CODE_00 && contentsRemain.result.gubun === 'Done') {
        res.render('billcontents/myt-fare.bill.contents.html', {
          result: this.parseData(contentsRemain.result),
          svcInfo: svcInfo, // 회선 정보 (필수)
          pageInfo: pageInfo, // 페이지 정보 (필수)
          currentMonth: this.getCurrentMonth() // 현재월 조회
        });
      } else {
        res.render('error.get-fail.html', {
          msg: PREPAY_ERR_MSG.FAIL,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }
    }, (error) => {
      this.errorRender(res, error, svcInfo, pageInfo);
    });
  }

  /* 잔여한도 조회 */
  private getContentsRemain(): Observable<any> {
    return this.getRemainLimit('Request', '0') // 최초 시도 시 Request, 0으로 호출
      .switchMap((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Done', '1'); // 이후 Done, 1로 호출 (필수)
            });
        } else {
          throw resp;
        }
      })
      .switchMap((next) => {
        if (next.code === API_CODE.CODE_00 && next.result.gubun === 'Done') {
          return Observable.of(next);
        } else {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Done', '2'); // 위에서 응답이 없을 경우 3초 뒤 Done, 2로 호출
            });
        }
      })
      .switchMap((next) => {
        if (next.code === API_CODE.CODE_00 && next.result.gubun === 'Done') {
          return Observable.of(next);
        } else {
          return Observable.timer(3000)
            .switchMap(() => {
              return this.getRemainLimit('Done', '3'); // 응답이 없을 경우 3초 뒤 Done, 3으로 호출
            });
        }
      });
  }

  /* 잔여한도 조회 */
  private getRemainLimit(gubun: string, requestCnt: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0081, { gubun: gubun, requestCnt: requestCnt });
  }

  /* 데이터 가공 */
  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.tmthUseAmount = FormatHelper.addComma(result.tmthUseAmt); // 당월 사용금액에 콤마(,) 추가
      result.remainLimit = FormatHelper.addComma(result.remainUseLimit); // 잔여한도에 콤마(,) 추가
      result.tmthChrgPsblAmount = FormatHelper.addComma(result.tmthChrgPsblAmt); // 선결제 가능금액에 콤마(,) 추가

      if (result.autoChrgStCd === MYT_FARE_PREPAY_AUTO_CHARGE_CODE.USE) { // 자동선결제 사용 중인 경우
        result.autoChrgAmount = FormatHelper.addComma(result.autoChrgAmt); // 자동선결제 금액에 콤마(,) 추가
        result.autoChrgStrdAmount = FormatHelper.addComma(result.autoChrgStrdAmt); // 기준금액에 콤마(,) 추가
      }
    }
    result.code = API_CODE.CODE_00;
    return result;
  }

  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth(); // 현재월 조회
  }

  private errorRender(res, resp, svcInfo, pageInfo): any {
    const code = resp.code === API_CODE.CODE_00 ? '' : resp.code;
    const msg = resp.code === API_CODE.CODE_00 ? PREPAY_ERR_MSG.FAIL : resp.msg;

    this.error.render(res, {
      code: code,
      msg: msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTFareBillContents;
