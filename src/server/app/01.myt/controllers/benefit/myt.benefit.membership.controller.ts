/**
 * FileName: myt.benefit.membership.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.16
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {Observable} from '../../../../../../node_modules/rxjs/Observable';
import {API_CMD, API_CODE, API_MYT_ERROR} from '../../../../types/api-command.type';
import {MyTMembershipData} from '../../../../mock/server/myt.benefit.membership.mock';

class MyTBenefitMembership extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.reqMembershipAPI()
    ).subscribe(([data]) => {
      this.renderView(res, svcInfo, data);
    });
  }

  private renderView(res: Response, svcInfo: any, data: any): any {
    if ( data.code === API_CODE.CODE_00) {
      res.render('benefit/myt.benefit.membership.html', this.getData(svcInfo, data) );
    } else if ( data.code === API_MYT_ERROR.MBR0001 || data.code === API_MYT_ERROR.MBR0002 ) {
      res.render('benefit/myt.benefit.membership-no.html', this.getData(svcInfo, data) );
    } else {
      this.error.render(res, {
        code: data.code,
        msg: data.msg,
        svcInfo: svcInfo
      });
    }
  }

  private getData(svcInfo: any, data: any): any {
    return {
      svcInfo,
      data : data.result
    };
  }

  private reqMembershipAPI(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0124, {}).map((response) => {
      return response;
    });
  }
  private reqMembershipMock(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(MyTMembershipData);
      observer.complete();
    });
  }
}

export default MyTBenefitMembership;
