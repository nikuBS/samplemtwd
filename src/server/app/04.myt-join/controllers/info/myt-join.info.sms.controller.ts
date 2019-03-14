import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MyTJoinSmsData} from '../../../../mock/server/myt.join.sms.mock';

/**
 * FileName: myt-join.info.sms.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.15
 */

class MyTJoinInfoSms extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      // this.mockReqSms()
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

  private getData(data: any, svcInfo: any, pageInfo: any): any {
    this.parseData(data);

    return {
      svcInfo,
      pageInfo,
      data,
      isBroadbandJoined: 'N'
    };
  }

  private parseData(data: any): void {
    if (  !FormatHelper.isEmpty(data.cntcNum) ) {
      if ( data.cntcNum.length > 11 ) {
        data.cntcNum = data.cntcNum.substring(data.cntcNum.length - 11);
      }
      data.cntcNum = FormatHelper.conTelFormatWithDash(data.cntcNum);
    }
  }

  protected reqSms(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0092, {});
  }

  private mockReqSms(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(  FormatHelper.objectClone(MyTJoinSmsData) );
      observer.complete();
    });
  }

  // API Response fail
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
