/**
 * FileName: myt.bil.hotbill.child.controller.ts.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 7. 9.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { PARAM } from './myt.bill.hotbill.controller'
import { Observable } from 'rxjs/Observable';

class MyTBillHotBillChild extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const billRequest: Observable<any> =  this.apiService.request(API_CMD.BFF_05_0035, {
        gubun: PARAM.TYPE.CURRENT,
        childSvcMgmtNum: req.query.childSvcMgmtNum
      });
    const childrenRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0024, {})
    Observable.combineLatest(
      billRequest,
      childrenRequest
    ).subscribe(([billData, children]) => {
      if ( billData['result'] && billData['result']['isSuccess'] === 'Y' ) {
        this.renderView(res, 'bill/myt.bill.hotbill.child.html', {
          svcInfo: svcInfo,
          onlyChild: (children.result.length <= 1),
          children: JSON.stringify( children.result)
         });
      } else {
        //TODO error처리
      }
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

}
export default MyTBillHotBillChild;
