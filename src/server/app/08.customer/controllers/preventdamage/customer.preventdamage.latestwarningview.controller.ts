/**
 * FileName: customer.preventdamage.latestwarningview.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.26
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';

class CustomerPreventdamageLatestwarningviewController extends TwViewController {
  constructor() {
    super();
  }

  private _convertData = (data: any) => {
    return Object.assign({}, data, {
      date: data.auditDtm.substr(0, 4) + '.' + data.auditDtm.substr(4, 2) + '.' + data.auditDtm.substr(6, 2)
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const lwid = req.query.lw_id || '';
    if (FormatHelper.isEmpty(lwid)) {
      res.redirect('/customer/prevent-damage/latest-warning');
    }

    this.apiService.request(API_CMD.BFF_08_0041, {}, {}, lwid)
      .subscribe((data) => {
        res.render('preventdamage/customer.preventdamage.latestwarningview.html', {
          svcInfo: svcInfo,
          data: this._convertData(data.result)
        });
      });
  }
}

export default CustomerPreventdamageLatestwarningviewController;
