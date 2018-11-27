/**
 * FileName: customer.damage-info.warning.view.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class CustomerDamageInfoWarningView extends TwViewController {
  constructor() {
    super();
  }

  private _convertData(data): any {
    return Object.assign(data, {
      date: DateHelper.getShortDateWithFormat(data.auditDtm, 'YYYY.M.DD.')
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const idx = req.query.idx || '';

    if (FormatHelper.isEmpty(idx)) {
      return res.redirect('/customer/damage-info/warning');
    }

    this.apiService.request(API_CMD.BFF_08_0041, {}, {}, idx)
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            title: '최신 이용자 피해예방 주의보',
            svcInfo: svcInfo,
            code: data.code,
            msg: data.msg
          });
        }

        res.render('damage-info/customer.damage-info.warning.view.html', {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          data: this._convertData(data.result)
        });
      });
  }
}

export default CustomerDamageInfoWarningView;
