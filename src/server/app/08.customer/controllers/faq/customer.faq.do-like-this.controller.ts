/**
 * FileName: customer.faq.do-like-this.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.12.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

class CustomerFaqDoLikeThis extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {
    const id = req.query.id;
    this.getContent(res, svcInfo, id).subscribe(
      (content) => {
        if (!FormatHelper.isEmpty(content)) {
          res.render('faq/customer.faq.do-like-this.html', {
            svcInfo, pageInfo, content
          });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          svcInfo
        });
      }
    );
  }

  private getContent(res: Response, svcInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0053, { mtwdBltn1CntsId: id }).map((resp) => {
    // return this.apiService.request(API_CMD.BFF_08_0064, {}, null, [id]).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // this.apiService.request(API_CMD.BFF_08_0065, {}, null, [id]);
        return resp.result.cntsCtt;
        // return resp.result.icntsCtt;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo
      });

      return null;
    });
  }
}

export default CustomerFaqDoLikeThis;
