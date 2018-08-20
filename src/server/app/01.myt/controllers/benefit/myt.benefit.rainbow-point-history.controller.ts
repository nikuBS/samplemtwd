/**
 * FileName: myt.benefit.rainbow-point-history.controller.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 20.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class MyTBenefitRainbowPointHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0132, {})
    ).subscribe(([ptRainbow]) => {
        if ( ptRainbow.code === API_CODE.CODE_00 ) {
          res.render('benefit/myt.benefit.rainbow-point-history.html', { svcInfo: svcInfo, point: ptRainbow.result });
        } else {
          res.render('error.server-error.html', {
            title: '이벤트',
            code: ptRainbow.code,
            msg: ptRainbow.msg,
            svcInfo: svcInfo
          });
        }
      }
    );
  }
}

export default MyTBenefitRainbowPointHistory;
