/**
 * FileName: customer.event.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.08.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
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
    }).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('event/customer.event.html', {
          content: resp.result.content,
          svcInfo: svcInfo
        });
      } else {
        res.render('error.server-error.html', {
          title: '이벤트',
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      }
    });
  }
}

export default CustomerEventController;
