/**
 * FileName: myt.benefit.rainbow-point.controller.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 17.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTBenefitRainbowPoint extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0132, {})
    ).subscribe(([ptRainbow]) => {
        if ( ptRainbow.code === API_CODE.CODE_00 ) {
          this._parseData(ptRainbow.result);
          res.render('benefit/myt.benefit.rainbow-point.html', { svcInfo: svcInfo, point: ptRainbow.result});
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

  _parseData(data){
    data.usblPoint = FormatHelper.addComma(data.usblPoint);
    data.erndPoint = FormatHelper.addComma(data.erndPoint);
    data.usdPoint = FormatHelper.addComma(data.usdPoint);
    data.exprdPoint = FormatHelper.addComma(data.exprdPoint);
  }
}

export default MyTBenefitRainbowPoint;
