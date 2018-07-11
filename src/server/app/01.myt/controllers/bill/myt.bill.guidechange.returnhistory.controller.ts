/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MyTBillReturnHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.renderView(res, 'bill/myt.bill.guidechange.returnhistory.html', {});
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

  // render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
  //   // home.main.sprint3 참조
  //   Observable.combineLatest(
  //     this.getReturnHistoryData()
  //   ).subscribe(([returnData]) => {
  //     const data = {
  //       returnData
  //     };
  //     res.render('bill/myt.bill.guidechange.returnhistory.html', data);
  //   });
  // }
  //
  // private getReturnHistoryData(): Observable<any> {
  //   // const reissueData = {};
  //   return this.apiService.request(API_CMD.BFF_05_0039, {}).map((resp) => {
  //     // 바로 받은 response 값은 확인 후 사용하지 않고 필요한 내용 추출하여 사용 예정
  //     // return reissueData;
  //     return resp;
  //   });
  // }
}

export default MyTBillReturnHistory;
