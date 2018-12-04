/**
 * FileName: tevent.win.detail.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.21
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

class TeventWinDetail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    const id = req.url.split('/')[3];

    this.apiService.request(API_CMD.BFF_09_0005, {}, {}, id).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('tevent.win.detail.html', {
          result: this.parseData(resp.result),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
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

export default TeventWinDetail;
