/**
 * @file myt-fare.bill.contents.controller.ts
 * @author Jayoon Kong
 * @since 2018.10.08
 * @desc 콘텐츠이용료 메인화면
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import CommonHelper from '../../../../utils/common.helper';
import { MYT_FARE_INFO_HISTORY } from '../../../../types/string.type';

/**
 * @class
 * @desc 콘텐츠이용료 메인
 */
class MyTFareBillContents extends TwViewController {
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

    const lineType = CommonHelper.getLineType(svcInfo);
    // console.log(">>>>>>>>> lineType: ", lineType, svcInfo.svcGr);
    // 법인회선인 경우  
    if ( lineType.isCompanyLine ) {
      // 법인회선 등급 C,D,E
      if (svcInfo.svcGr === 'C' || svcInfo.svcGr === 'D' || svcInfo.svcGr === 'E') {
        this.defaultRender(res, svcInfo, pageInfo);
      } 
      else { 
        this.errorRender(req, res, pageInfo, svcInfo);
      }
    } else { // 법인회선이 아닌 경우 
      Observable.from(this.isAdult(API_CMD.BFF_05_0080)).subscribe(isAdult => {
        if (isAdult) { // 미성년자 법대 동의 
          req.query.isAdult = true;
          this.errorRender(req, res, pageInfo, svcInfo);
        } else { // 미성년자 법대 미동의 
          if (svcInfo.svcGr === 'Y' || svcInfo.svcGr === 'A') { // 일반회선 인증A, 인증B
            this.defaultRender(res, svcInfo, pageInfo);
          } else {
            this.errorRender(req, res, pageInfo, svcInfo);
          }  
        }
      });
    }
  }

  private defaultRender(res: Response, svcInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getUnusualStatus()
    ).subscribe(([unusualStatus]) => {
      res.render('billcontents/myt-fare.bill.contents.html', {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        unusualYn: unusualStatus,
        currentMonth: this.getCurrentMonth()
      });
    });
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
   * @desc 특이고객 유/무
   * @returns Observable<any>
   */
  private getUnusualStatus(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0103, {}).map( resp => {
      return (resp.code === API_CODE.CODE_00 && resp.result.spcl_sp_yn === 'Y') ? 'Y' : 'N';
    });
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

    let error = {
      title: '',
      contents: ''
    };
    if (res.query.isAdult) { // 미성년자 메세지 
        error.title = MYT_FARE_INFO_HISTORY.ERROR.NO_ADULT_LINE.title;
        error.contents = '';
    } else { // 법인회선 메세지
      error.title = MYT_FARE_INFO_HISTORY.ERROR.COMPANY_LINE.title;
      error.contents = MYT_FARE_INFO_HISTORY.ERROR.COMPANY_LINE.contents
    }
    const code = res.query.code || '',
          msg = error.title,
          subMsg = error.contents,
          isPopupCheck = false;
    this.error.render(res, {
      code: code,
      msg: msg,
      subMsg: subMsg,
      pageInfo: pageInfo,
      svcInfo: svcInfo,
      isPopupCheck: isPopupCheck
    });

    // this.error.render(res, {
    //   code: resp.code,
    //   msg: resp.msg,
    //   pageInfo: pageInfo,
    //   svcInfo: svcInfo
    // });
  }
  /**
   * @return {Observable}
   * @desc 소액결제, 콘텐츠결제 미성년자여부 체크 
   */
  private isAdult = (apiName): Observable<any | null> => {
    // BFF_05_0080: 소액결제, BFF_05_0066: 콘텐츠 결제 
    return this.apiService.request(apiName, {}).map((resp: { code: string; result: any }) => {
      // console.log(">>>>>>>>>>>> isAdult Code: ", resp.code);
      if (resp.code === 'BIL0031') {
        resp.result = true;
      } else {
        resp.result = false;
      }
      return resp.result;
    });
  }
  
}

export default MyTFareBillContents;
