/**
 * FileName: customer.faq.category.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

export default class CustomerFaqCategoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code;
    const title = req.query.title;

    this.apiService.request(API_CMD.BFF_08_0051, { ifaqGrpCd: code })
      .subscribe((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          const is2depth = resp.result.faq2DepthGrp.length > 0 ? true : false;
          this.apiService.request(API_CMD.BFF_08_0052, {
            faqDepthGrpCd: is2depth ? resp.result.faq1DepthGrp[0].ifaqGrpCd : code,
            faqDepthCd: 2,
            page: 0,
            size: 20
          }).subscribe((response) => {
            if (response.code === API_CODE.CODE_00) {
              response.result.content = response.result.content.map((item) => {
                item.answCtt = this.purify(item.answCtt);
                return item;
              });
              res.render('faq/customer.faq.category.html', {
                svcInfo: svcInfo,
                title: title,
                is2depth: is2depth,
                rootCategory: code,
                depth1: resp.result.faq1DepthGrp,
                depth2: resp.result.faq2DepthGrp,
                list: response.result.content,
                isLast: response.result.last
              });
            } else {
              this.logger.warn('[FAQ category list]', response);
            }
          }, (err) => {
            this.logger.error('[FAQ]', err);
          });
        } else {
          this.logger.warn('[FAQ category]', resp);
        }
      }, (err) => {
        this.logger.error('[FAQ]', err);
      });
  }

  private purify(text: string): String {
    return text.trim()
      .replace(/\r\n/g, '<br/>');
  }
}
