/**
 * FileName: customer.event.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { PROMOTION_TYPE } from '../../../../types/bff.type';
import { HEAD_TITLE } from '../../../../types/title.type';

class CustomerEvent extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void {
    this.apiService.request(API_CMD.BFF_09_0001, {
      svcDvcClCd: 'M',
      page: 0,
      size: DEFAULT_LIST_COUNT
    }).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('event/customer.event.html', {
          content: this.parseData(resp.result.content),
          totalPages: resp.result.totalPages,
          totalElements: resp.result.totalElements,
          svcInfo: svcInfo
        });
      } else {
        res.render('error.server-error.html', {
          title: HEAD_TITLE.EVENT,
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
        data.startDate = DateHelper.getShortDateNoDot(data.prStaDt);
        data.endDate = DateHelper.getShortDateNoDot(data.prEndDt);
        data.dday = DateHelper.getNewRemainDate(data.prEndDt) - 1;
        data.promotionType = data.prTypCd === 'E' ? PROMOTION_TYPE[data.prTypCd] : null;
      });
    }
    content.code = API_CODE.CODE_00;
    return content;
  }
}

export default CustomerEvent;
