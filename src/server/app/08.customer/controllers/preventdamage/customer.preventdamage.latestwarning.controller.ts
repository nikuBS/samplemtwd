/**
 * FileName: customer.preventdamage.latestwarning.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.26
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class CustomerPreventdamageLatestwarningController extends TwViewController {
  constructor() {
    super();
  }

  private _convertData(data): any {
    if (data.code !== API_CODE.CODE_00) {
      return {
        total: 0,
        remain: 0,
        list: [],
        last: true
      };
    }

    return {
      total: data.result.totalElements,
      remain: this._getRemainCount(data.result.totalElements, data.result.pageable.pageNumber, data.result.pageable.pageSize),
      list: data.result.content.map(item => {
        return Object.assign(item, {
          date: DateHelper.getShortDateWithFormat(item.auditDtm, 'YY.MM.DD')
        });
      }),
      last: data.result.last
    };
  }

  private _getRemainCount(total, page, pageSize): any {
    const count = total - ((++page) * pageSize);
    return count < 0 ? 0 : count;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0033, {page: 0, size: 20})
      .subscribe((data) => {
        if (FormatHelper.isEmpty(data)) {
          return res.redirect('/customer/prevent-damage');
        }

        res.render('preventdamage/customer.preventdamage.latestwarning.html', {
          svcInfo: svcInfo,
          data: this._convertData(data)
        });
      });
  }
}

export default CustomerPreventdamageLatestwarningController;
