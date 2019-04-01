/**
 * FileName: myt-fare.bill.small.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 * Description: 소액결제 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME, MYT_FARE_PREPAY_AUTO_CHARGE_CODE} from '../../../../types/bff.type';
import {PREPAY_ERR_MSG} from '../../../../types/string.type';

class MyTFareBillSmall extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getMicroRemain(), // 잔여한도 조회
      this.getHistory(),
      this.getPasswordStatus()
    ).subscribe(([microRemain, microHistory, passwordStatus]) => {
      if (microRemain.code === API_CODE.CODE_00 && microRemain.result.gubun === 'Done') {
        res.render('billsmall/myt-fare.bill.small.html', {
          result: this.parseData(microRemain.result),
          usedYn: this.getHistoryInfo(microHistory),
          passwordInfo: this.getPasswordInfo(passwordStatus),
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

  private getMicroRemain(): Observable<any> {
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
    return this.apiService.request(API_CMD.BFF_07_0073, { gubun: gubun, requestCnt: requestCnt });
  }

  /* 소액결제 사용여부 및 비밀번호 서비스 사용여부 조회 */
  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0079, {});
  }

  /* getHistory 결과 가공 */
  private getHistoryInfo(historyInfo: any): any {
    const usedValueList = ['0', '2', '6']; // 소액결제 제한 없음/사용 코드값
    const usedYn = {
      isUsed: false,
      isPassword: false,
      rtnUseYn: null
    };

    if (historyInfo.code === API_CODE.CODE_00) {
      const rtnUseYn = historyInfo.result.rtnUseYn; // 소액결제 사용여부
      for (let i = 0; i < usedValueList.length; i++) { // 0,2,6이면 사용으로 표시
        if (rtnUseYn === usedValueList[i]) {
          usedYn.isUsed = true;
        }
      }
      usedYn.rtnUseYn = historyInfo.result.rtnUseYn;
      usedYn.isPassword = historyInfo.result.cpmsYn === 'Y'; // 비밀번호 서비스 사용여부
    }
    return usedYn;
  }

  /* 비밀번호 상태 조회 */
  private getPasswordStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0085, {});
  }

  /* getPasswordStatus 가공 */
  private getPasswordInfo(passwordStatus: any): any {
    if (passwordStatus.code === API_CODE.CODE_00) {
      const passwordResult = passwordStatus.result;
      passwordStatus.text = MYT_FARE_MICRO_NAME[passwordResult.cpinStCd]; // 코드값에 따라 신청, 변경, 잠김, 초기화 문구 셋팅
      passwordStatus.cpmsYn = passwordResult.cpmsYn;
    } else {
      if (passwordStatus.code === 'BIL0054') { // 부가서비스에 가입하지 않은 사용자의 경우
        passwordStatus.text = MYT_FARE_MICRO_NAME['NC']; // 신청으로 텍스트 표기
        passwordStatus.result = {};
        passwordStatus.result.cpinStCd = 'NA00003909'; // 부가서비스 상품코드 (페이지로 이동)
      } else {
        passwordStatus.text = '';
      }
    }
    return passwordStatus;
  }

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
    this.error.render(res, {
      code: resp.code,
      msg: resp.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTFareBillSmall;
