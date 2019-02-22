import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MyTJoinContractData} from '../../../../mock/server/myt.join.contract.mock';
import DateHelper from '../../../../utils/date.helper';

/**
 * FileName: myt-join.info.contract.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.15
 */

class MyTJoinInfoContract extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      // this.mockReqContract()
      this.reqContract()
    ).subscribe(([resp]) => {
      if ( resp.code === API_CODE.CODE_00) {
        const data = this.getData(resp.result, svcInfo, pageInfo);
        res.render( 'info/myt-join.info.contract.html', data );
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
      data
    };
  }

  private parseData(data: any): void {
    data.svsetPrefrDtm = DateHelper.getShortDateNoDot(data.svsetPrefrDtm);
    // 가입유형은 "신규가입/번호이동가입" 으로 2개의 값을 주기 때문에 슬러시 뒤에 값으로 보여주도록 한다.
    if ( data.svcChgNm.indexOf('/') > 0 ) {
      data.svcChgNm = data.svcChgNm.split('/')[1];
    }
  }

  protected reqContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0139, {});
  }

  private mockReqContract(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(  FormatHelper.objectClone(MyTJoinContractData) );
      observer.complete();
    });
  }

  // API Response fail
  private fail(res: Response, data: any, svcInfo: any, pageInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo,
      pageInfo: pageInfo
    });
  }
}

export default MyTJoinInfoContract;
