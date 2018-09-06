/**
 * FileName: myt.benefit.military-point-history.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 28.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTBenefitMilitaryPointHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0120, {})
    ).subscribe(([ptMilitary]) => {
        if ( ptMilitary.code === API_CODE.CODE_00 ) {
          this._parseData(ptMilitary.result);
          res.render('benefit/myt.benefit.military-point-history.html', { svcInfo: svcInfo, point: ptMilitary.result });
        } else {
          res.render('error.server-error.html', {
            title: '이벤트',
            code: ptMilitary.code,
            msg: ptMilitary.msg,
            svcInfo: svcInfo
          });
        }
      }
    );
  }

  _parseData(data: any) {
    data.usblPoint = FormatHelper.addComma(data.usblPoint);
  }
}

export default MyTBenefitMilitaryPointHistory;
