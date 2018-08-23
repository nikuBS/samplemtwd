/**
 * FileName: customer.faq.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export default class CustomerFaqController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const queryString = req.query.search;

    if (FormatHelper.isEmpty(queryString)) {
      this.getDoItLikeThisList().subscribe((result) => {
        res.render('faq/customer.faq.html', {
          svcInfo: svcInfo,
          doItList: result
        });
      });
    } else {
      this.apiService.request(API_CMD.BFF_08_0050, {
        srchKey: encodeURIComponent(queryString),
        page: 0,
        size: 20
      }).subscribe((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          if (resp.result.content.length === 0) {
            res.render('faq/customer.faq.no-result.html', {
              svcInfo: svcInfo,
              queryString: queryString
            });
          } else {
            for (let i = 0; i < resp.result.content.length; i++) {
              resp.result.content[i].answCtt = this.purify(resp.result.content[i].answCtt);
            }
            res.render('faq/customer.faq.result.html', {
              svcInfo: svcInfo,
              queryString: queryString,
              totalCount: resp.result.totalElements,
              contents: resp.result.content,
              isLast: resp.result.last
            });
          }
        } else {
          this.logger.warn('[FAQ search]', resp);
        }
      }, (err) => {
        this.logger.error('[FAQ search]', err);
      });
    }
  }

  private getDoItLikeThisList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0026, {}).map((res) => {
      if (res.code === API_CODE.CODE_00) {
        return res.result;
      }
    });
  }

  private purify(text: String): String {
    return text.trim()
      .replace(/\r\n/g, '<br/>');
  }
}
