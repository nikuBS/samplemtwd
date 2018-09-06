/**
 * FileName: myt.benefit.cookiz-point-history.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 8. 28.
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MyTBenefitCookizPointHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0115, {})
    ).subscribe(([ptCookiz]) => {
        if ( ptCookiz.code === API_CODE.CODE_00 ) {
          this._parseData(ptCookiz.result);
          res.render('benefit/myt.benefit.cookiz-point-history.html', { svcInfo: svcInfo, point: ptCookiz.result });
        } else {
          res.render('error.server-error.html', {
            title: '이벤트',
            code: ptCookiz.code,
            msg: ptCookiz.msg,
            svcInfo: svcInfo
          });
        }
      }
    );
  }

  _parseData(data: any) {
    data.usblPoint = FormatHelper.addComma(data.usblPoint);
    data.erndPoint = FormatHelper.addComma(data.erndPoint);
    data.usdPoint = FormatHelper.addComma(data.usdPoint);
    data.exprdPoint = FormatHelper.addComma(data.exprdPoint);
  }
}

export default MyTBenefitCookizPointHistory;
