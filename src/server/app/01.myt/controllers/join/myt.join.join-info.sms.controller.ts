/**
 * FileName: myt.join.join-info.sms.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.07
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';

class MyTJoinJoinInfoSmsController extends TwViewController {
  private _svcInfo: any;

  get svcInfo() {
    return this._svcInfo;
  }
  set svcInfo( __svcInfo: any ) {
    this._svcInfo = __svcInfo;
  }

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // this.svcInfo = svcInfo;

    Observable.combineLatest(
      this.reqSmsAPI()
    ).subscribe(([data]) => {
      res.render('join/myt.join.join-info.sms.html', this.getData(svcInfo, data) );
    });
  }

  private getResult(data: any): any {
    if (data.code === API_CODE.CODE_00) {
      return data.result;
    } else {
      return data;
    }
  }

  private getData(svcInfo: any, data: any): any {
    return {
      svcInfo,
      data : this.getResult(data) || {}
    };
  }

  private reqSmsAPI(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0092, {}).map((response) => {
      return response;
    });
  }
}

export default MyTJoinJoinInfoSmsController;
