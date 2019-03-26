import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * FileName: myt-join.info.sms.controller.ts
 * 화면 ID : MS_02_02
 * 설명 : 나의가입정보 > 망 작업 SMS 알림 신청
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.15
 */

class MyTJoinInfoSms extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.reqSms()
    ).subscribe(([resp]) => {
      if ( resp.code === API_CODE.CODE_00) {
        const data = this.getData(resp.result, svcInfo, pageInfo);
        res.render( 'info/myt-join.info.sms.html', data );
      } else {
        this.fail(res, resp, svcInfo, pageInfo);
      }
    });
  }

  /**
   * 화면 수신 데이터 생성
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  private getData(data: any, svcInfo: any, pageInfo: any): any {
    this.parseData(data);

    return {
      svcInfo,
      pageInfo,
      data,
      isBroadbandJoined: 'N'
    };
  }

  /**
   * 데이터 파싱
   * @param data
   */
  private parseData(data: any): void {
    if (  !FormatHelper.isEmpty(data.cntcNum) ) {
      if ( data.cntcNum.length > 11 ) {
        data.cntcNum = data.cntcNum.substring(data.cntcNum.length - 11);
      }
      data.cntcNum = FormatHelper.conTelFormatWithDash(data.cntcNum);
    }
  }

  /**
   * 망 작업 SMS 알림 API 조회
   */
  protected reqSms(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0092, {});
  }

  /**
   * API Response fail
   * @param res
   * @param data
   * @param svcInfo
   * @param pageInfo
   */
  private fail(res: Response, data: any, svcInfo: any, pageInfo: any): void {
    if (data.code === 'MOD0040') { // SK브로드밴드 가입자
      return res.render('info/myt-join.info.sms.html', {
        svcInfo,
        pageInfo,
        data: {},
        isBroadbandJoined: 'Y'
      });
    }
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

export default MyTJoinInfoSms;
