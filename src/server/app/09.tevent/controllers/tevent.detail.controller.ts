/**
 * FileName: tevent.detail.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.21
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

class TeventDetail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    const id = req.url.split('/')[2];

    this.apiService.request(API_CMD.BFF_09_0002, {}, {}, [id]).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('tevent.detail.html', {
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
      result.startDate = DateHelper.getShortDate(result.prStaDt);
      result.endDate = DateHelper.getShortDate(result.prEndDt);
      result.height = result.prUrlHSize + 'px';
    }
    return result;
  }
}

export default TeventDetail;
