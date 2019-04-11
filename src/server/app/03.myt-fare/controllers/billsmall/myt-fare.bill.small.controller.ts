/**
 * @file myt-fare.bill.small.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.04
 * @desc 소액결제 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {MYT_FARE_MICRO_NAME} from '../../../../types/bff.type';

/**
 * @class
 * @desc 소액결제 메인
 */
class MyTFareBillSmall extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getHistory(),
      this.getPasswordStatus()
    ).subscribe(([microHistory, passwordStatus]) => {
      res.render('billsmall/myt-fare.bill.small.html', {
        usedYn: this.getHistoryInfo(microHistory),
        passwordInfo: this.getPasswordInfo(passwordStatus),
        svcInfo: svcInfo, // 회선 정보 (필수)
        pageInfo: pageInfo, // 페이지 정보 (필수)
        currentMonth: this.getCurrentMonth() // 현재월 조회
      });
    }, (error) => {
      this.errorRender(res, error, svcInfo, pageInfo);
    });
  }

  /**
   * @function
   * @desc 소액결제 사용여부 및 비밀번호 서비스 사용여부 조회
   * @returns {Observable<any>}
   */
  private getHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0079, {});
  }

  /**
   * @function
   * @desc parsing getHistory result
   * @param historyInfo
   * @returns {any}
   */
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

  /**
   * @function
   * @desc 비밀번호 상태 조회
   * @returns {Observable<any>}
   */
  private getPasswordStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0085, {});
  }

  /**
   * @function
   * @desc parsing getPasswordStatus result
   * @param passwordStatus
   * @returns {any}
   */
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

  /**
   * @function
   * @desc 현재월 조회
   * @returns {any}
   */
  private getCurrentMonth(): any {
    return DateHelper.getCurrentMonth();
  }

  /**
   * @function
   * @desc error render
   * @param res
   * @param resp
   * @param svcInfo
   * @param pageInfo
   * @returns {any}
   */
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
