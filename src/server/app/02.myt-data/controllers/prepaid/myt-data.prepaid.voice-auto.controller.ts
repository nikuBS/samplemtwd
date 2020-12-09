/**
 * @file myt-data.prepaid.voice-auto.controller.ts
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.11.28
 * @desc 선불폰 음성 자동 충전 페이지
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {PREPAID_AMT_CD} from '../../../../types/bff.type';

/**
 * @class
 * @desc 선불폰 음성 자동 충전
 */
class MyTDataPrepaidVoiceAuto extends TwViewController {
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
    if ( BrowserHelper.isApp(req) ) { // 앱인 경우에만 진입 가능
      this.renderPrepaidVoiceAuto(req, res, next, svcInfo, pageInfo);
    } else { // 모바일웹인 경우 앱 설치 유도 페이지로 이동
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  /**
   * @function
   * @desc 자동 충전 정보 조회
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param pageInfo
   * @returns {Subscription}
   */
  public renderPrepaidVoiceAuto = (req: Request, res: Response, next: NextFunction, svcInfo, pageInfo) =>
    this.getAutoPPSInfo().subscribe((AutoInfo) => {
      res.render('prepaid/myt-data.prepaid.voice-auto.html', {
        AutoInfo: this.parseAuto(AutoInfo), // 자동 충전 정보
        svcInfo: svcInfo, // 회선 정보 (필수)
        pageInfo: pageInfo, // 페이지 정보 (필수)
        convertAmount: this.convertAmount, // 금액 정보 format
        convertDashDate: this.convertDashDate // 날짜 정보 format
      });
  })

  /**
   * @function
   * @desc PPS 정보 조회
   * @returns {Observable<any>}
   */
  public getAutoPPSInfo = () => this.apiService.request(API_CMD.BFF_06_0055, {});

  /**
   * @function
   * @desc parsing data
   * @param AutoInfo
   * @returns {any}
   */
  private parseAuto(AutoInfo: any): any {
    let result: any;

    if ( !FormatHelper.isEmpty(AutoInfo.result) ) {
      result = AutoInfo.result;
      result.amtValue = PREPAID_AMT_CD[result.amtCd]; // 설정된 금액 또는 날짜
      result.endDate = DateHelper.getDashShortDateNoDot(result.endDt); // 설정된 종료기간
    } else {
      return null;
    }

    return result;
  }

  /**
   * @function
   * @desc convert format from YYYYMMDD to YYYY.M.D.
   * @param sDate
   * @returns {string}
   */
  public convertDashDate = (sDate) => DateHelper.getShortDateNoDot(sDate);

  /**
   * @function
   * @desc convert format from 00000 to 00,000
   * @param sAmount
   * @returns {string}
   */
  public convertAmount = (sAmount) => FormatHelper.addComma(sAmount);
}

export default MyTDataPrepaidVoiceAuto;
