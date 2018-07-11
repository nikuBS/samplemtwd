/**
 * FileName: myt.bill.hotbill.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018.07.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export const PARAM = {
  TYPE: {
    CURRENT: 'Q',
    PREVIOUS: 'G'
  }
};

class MyTBillHotBill extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    //TODO svcAttrCd 완성 되면 삭제
    svcInfo.svcAttrCd = req.query.code || 'M1';
    var type = '';
    switch( svcInfo.svcAttrCd){
      case 'M3':
        type = 'T pocket Fi';
        break;
      default:
        type = '휴대폰';
        break;
    }
    svcInfo.svcType = type;

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0035, { gubun: PARAM.TYPE.PREVIOUS })
    ).subscribe(([]) => {
      this.renderView(res, 'bill/myt.bill.hotbill.html', { svcInfo: svcInfo });
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

}

export default MyTBillHotBill;
