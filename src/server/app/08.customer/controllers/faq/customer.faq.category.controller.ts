/**
 * FileName: customer.faq.category.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import LoggerService from '../../../../services/logger.service';

export default class CustomerFaqCategoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code;

    this.apiService.request(API_CMD.BFF_08_0051, {
      ifaqGrpCd: code
    }).subscribe((resp) => {
    });

    // this.apiService.request(API_CMD.BFF_08_0053, {
      // mtwdBltn1CntsId: 'TIP001'
    // }).subscribe((resp) => {
    // });
  }
}
