/**
 * FileName: myt.bill.billguide.subRoamingBill.controller
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.19
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTBillBillguideSubRoamingBill extends TwViewController {
  constructor() {
    super();
  }


  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // const roamingBillRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0044, {});
    // Observable.combineLatest(
    //   roamingBillRequest,
    // ).subscribe(([_roamingBill]) => {
    //   const roamingBill = this.getResult(_roamingBill);
    //   console.log('~~~~svcInfo', svcInfo);
    //   console.log('~~~~roamingBill', roamingBill);
    // });
    this.renderView(res, 'bill/myt.bill.billguide.subRoamingBill.html', {
      svcInfo
    });
  }


  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

  private getResult(resp: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      return resp.result;
    }
    return resp;
  }
}

export default MyTBillBillguideSubRoamingBill;

