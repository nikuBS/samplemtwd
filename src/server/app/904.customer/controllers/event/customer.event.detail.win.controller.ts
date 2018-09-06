/**
 * FileName: customer.event.detail.win.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { HEAD_TITLE } from '../../../../types/title.type';

class CustomerEventDetailWin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void {
    const id = req.query['prNum'];

    this.apiService.request(API_CMD.BFF_09_0005, {}, {}, id).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('event/customer.event.detail.win.html', {
          result: this.parseData(resp.result),
          svcInfo: svcInfo
        });
      } else {
        res.render('error.server-error.html', {
          title: HEAD_TITLE.EVENT_DETAIL,
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      }
    });
  }

  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.startDate = DateHelper.getShortDateNoDot(result.prStaDt);
      result.endDate = DateHelper.getShortDateNoDot(result.prEndDt);
      result.winDate = DateHelper.getShortDateNoDot(result.winDt);
      result.height = result.winUrlHSize + 'px';
    }
    return result;
  }
}

export default CustomerEventDetailWin;
