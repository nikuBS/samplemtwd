/**
 * @file myt-fare.bill.rainbow.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.7
 * @desc 레인보우포인트 요금납부 1회 예약 및 자동납부 관리 page
 */

import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_FARE_PAYMENT_NAME, RAINBOW_FARE_CODE, RAINBOW_FARE_NAME} from '../../../../types/bff.type';
import {DEFAULT_SELECT} from '../../../../types/string.type';

/**
 * @class
 * @desc 레인보우포인트 요금납부 1회 예약 및 자동납부 관리
 */
class MyTFareBillRainbow extends TwViewController {

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
      this.getRainbowPoint(), // 레인보우포인트 정보 조회
      this.getAutoRainbow() // 레인보우포인트 자동납부 예약 여부 조회
    ).subscribe(([rainbow, auto]) => {
      if (rainbow.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.rainbow.html', {
          rainbow: this.parseData(rainbow.result),
          autoInfo: this.getAutoData(auto),
          svcInfo: svcInfo, // 회선 정보 (필수)
          pageInfo: pageInfo // 페이지 정보 (필수)
        });
      } else {
        this.error.render(res, {
          code: rainbow.code,
          msg: rainbow.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  /**
   * @function
   * @desc 레인보우포인트 정보 조회
   * @returns {Observable<any>}
   */
  private getRainbowPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0132, {});
  }

  /**
   * @function
   * @desc 레인보우포인트 자동납부 정보 조회
   * @returns {Observable<any>}
   */
  private getAutoRainbow(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0052, {});
  }

  /**
   * @function
   * @desc parsing data
   * @param data
   * @returns {any}
   */
  private parseData(data: any): any {
    data.point = FormatHelper.addComma(data.usblPoint); // 포인트에 콤마(,) 추가
    return data;
  }

  /**
   * @function
   * @desc get auto data
   * @param autoInfo
   * @returns {any}
   */
  private getAutoData(autoInfo: any): any {
    if (autoInfo.code === API_CODE.CODE_00) {
      return {
        isAuto: autoInfo.result.reqStateNm === MYT_FARE_PAYMENT_NAME.IS_AUTO, // 자동납부 신청인 경우
        autoFareCode: FormatHelper.isEmpty(autoInfo.result.rbpChgCd) ? '' : RAINBOW_FARE_CODE[autoInfo.result.rbpChgCd], // 자동납부 대상 코드
        autoFareText: FormatHelper.isEmpty(autoInfo.result.rbpChgCd) ? DEFAULT_SELECT.SELECT : RAINBOW_FARE_NAME[autoInfo.result.rbpChgCd]
        // 자동납부 정보가 있으면 대상 요금, 없으면 '선택하세요' 표시
      };
    }
    return null;
  }

}

export default MyTFareBillRainbow;
