/**
 * FileName: customer.damage-info.warning.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';

class CustomerDamageInfoWarning extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param list
   * @private
   */
  private _convertList(list): any {
    return list.map(item => {
      return Object.assign(item, {
        date: DateHelper.getShortDateWithFormat(item.auditDt, 'YYYY.M.D.')
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00001' }),
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00002' })
    ).subscribe(([warningTopInfo, warningNormalInfo]) => {
      const apiError = this.error.apiError([warningTopInfo, warningNormalInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('damage-info/customer.damage-info.warning.html', Object.assign(renderCommonInfo, {
        importList: this._convertList(warningTopInfo.result.content),
        normalList: this._convertList(warningNormalInfo.result.content),
        totalPages: warningNormalInfo.result.totalPages
      }));
    });
  }
}

export default CustomerDamageInfoWarning;
