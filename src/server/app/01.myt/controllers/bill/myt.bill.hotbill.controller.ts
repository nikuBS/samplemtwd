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
    CURRENT: 'G',
    PREVIOUS: 'Q'
  }
};

class MyTBillHotBill extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    var type = '';
    var billAvailable = true;
    switch ( svcInfo.svcAttrCd ) {
      case 'M3':
        type = 'T pocket Fi';
        break;
      case 'M1':
        type = '휴대폰';
        //pocketFi: 메월 1일 메세지 표시
        if ( new Date().getDate() === 1 ) {
          billAvailable = false;
        }
        break;
      default:
        //TODO 메뉴에서 거르지 못하고 진입 시 처리
        this.logger.error(this, '[API_ERR]', `Unsupported type '${type}' in the hotbill service.`);
        break;
    }
    svcInfo.svcType = type;
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0035, { gubun: PARAM.TYPE.PREVIOUS })
    ).subscribe(([]) => {
      this.renderView(res, 'bill/myt.bill.hotbill.html', { svcInfo: svcInfo, billAvailable: billAvailable });
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }
}
export default MyTBillHotBill;
