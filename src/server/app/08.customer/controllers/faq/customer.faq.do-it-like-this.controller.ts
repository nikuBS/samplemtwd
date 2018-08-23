/**
 * FileName: customer.faq.do-it-liek-this.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

export default class CustomerFaqDoItLikeThisController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code;
    this.getDoItLikeThis(code)
      .subscribe(
        (resp) => {
          res.render('faq/customer.faq.do-it-like-this.html', {
            svcInfo: svcInfo,
            content: resp.cntsCtt
          });
        },
        (err) => {
          this.error.render(res, {
            title: '이럴 땐 이렇게 하세요',
            code: err.code,
            msg: err.msg,
            svcInfo: svcInfo
          });
        }
      );
  }

  private getDoItLikeThis(code: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0053, { mtwdBltn1CntsId: code }).map((res) => {
      if (res.code === API_CODE.CODE_00) {
        return res.result;
      }
    });
  }
}
