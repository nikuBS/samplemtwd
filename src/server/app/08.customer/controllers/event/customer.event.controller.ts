/**
 * FileName: customer.event.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { DEFAULT_LIST_COUNT } from '../../../../types/config.type';

class CustomerEventController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void {
    this.apiService.request(API_CMD.BFF_09_0001, {
      svcDvcClCd: 'M',
      page: 0,
      size: DEFAULT_LIST_COUNT
    }).subscribe(() => {
      res.render('event/customer.event.html', {
        svcInfo: svcInfo
      });
    });
  }
}

export default CustomerEventController;
