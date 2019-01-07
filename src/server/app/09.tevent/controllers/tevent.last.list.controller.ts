/**
 * FileName: tevent.last.list.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.21
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { DEFAULT_LIST_COUNT } from '../../../types/config.type';
import { PROMOTION_TYPE } from '../../../types/bff.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

class TeventLastList extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    this.apiService.request(API_CMD.BFF_09_0003, {
      svcDvcClCd: 'M',
      page: 0,
      size: DEFAULT_LIST_COUNT
    }).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const result = resp.result;
        res.render('tevent.last.list.html', {
          content: this.parseData(result.content),
          totalPages: result.totalPages,
          totalElements: result.totalElements,
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

  private parseData(content: any): any {
    if (!FormatHelper.isEmpty(content)) {
      content.map((data) => {
        data.startDate = DateHelper.getShortDate(data.prStaDt);
        data.endDate = DateHelper.getShortDate(data.prEndDt);
        data.promotionType = data.prTypCd === 'E' ? PROMOTION_TYPE[data.prTypCd] : null;
      });
    }
    content.code = API_CODE.CODE_00;
    return content;
  }
}

export default TeventLastList;
