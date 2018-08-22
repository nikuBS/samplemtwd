/**
 * FileName: customer.faq.category.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export default class CustomerFaqCategoryController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code;
    const title = req.query.title;
    const htmlPath = 'faq/customer.faq.category.html';

    const data = {
      svcInfo: svcInfo,
      title: title,
      is2depth: false,
      rootCategory: code,
      depth1: [],
      depth2: [],
      list: [],
      isLast: false
    };

    this.checkIf2Depth(code).subscribe((depthChecked) => {
      data.depth1 = depthChecked.depth1;
      if (depthChecked.is2depth) {
        Observable.combineLatest(
          this.get2depth(depthChecked.depth1[0].ifaqGrpCd),
          this.getFaqList(depthChecked.depth1[0].ifaqGrpCd)
        ).subscribe((resp) => {
          data.is2depth = true;
          data.depth2 = resp[0];
          data.list = resp[1].list;
          data.isLast = resp[1].isLast;
          res.render(htmlPath, data);
        }, (err) => {
        });

      } else {
        this.getFaqList(code).subscribe((faqList) => {
          data.list = faqList.list;
          data.isLast = faqList.isLast;
          res.render(htmlPath, data);
        }, (err) => {
        });

      }
    }, (err) => {
    });
  }

  private checkIf2Depth(code: String): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0051, { ifaqGrpCd: code })
      .map((res) => {
        if (res.code === API_CODE.CODE_00) {
          return {
            depth1: res.result.faq1DepthGrp,
            is2depth: res.result.faq2DepthGrp.length > 0 ? true : false
          };
        }
      });
  }

  private get2depth(code: String): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0051, { ifaqGrpCd: code })
      .map((res) => {
        if (res.code === API_CODE.CODE_00) {
          return res.result.faq1DepthGrp;
        }
        return null;
      });
  }

  private getFaqList(groupCode: String): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0052, {
      faqDepthGrpCd: groupCode,
      faqDepthCd: 2,
      page: 0,
      size: 20
    }).map((res) => {
      if (res.code === API_CODE.CODE_00) {
        return {
          list: res.result.content,
          isLast: res.result.last
        };
      }
      return null;
    });
  }

  private purify(text: string): String {
    return text.trim()
      .replace(/\r\n/g, '<br/>');
  }
}
