/**
 * FileName: customer.faq.search.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.12.02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

class CustomerFaqCategory extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    const categoryId = req.query.id;
    const title = req.query.title;
    this.getCategoryList(res, svcInfo, pageInfo, categoryId)
      .subscribe(
        (result) => {
          if (!FormatHelper.isEmpty(result)) {
            let is2depth = true;
            if (FormatHelper.isEmpty(result.faq2DepthGrp)) {
              is2depth = false;
            }
            const data = {
              is2depth,
              rootCategory: categoryId,
              depth1: result.faq1DepthGrp,
              depth2: result.faq2DepthGrp,
              list: [],
              isLast: false
            };

            const group = is2depth ? data.depth1[0].ifaqGrpCd : categoryId;
            this.getFaqList(res, svcInfo, pageInfo, group, 2).subscribe(
              (result2) => {
                data.list = result2.list;
                data.isLast = result2.isLast;
                res.render('faq/customer.faq.category.html', {
                  svcInfo, pageInfo, title, data
                });
              },
              (err) => {
                this.error.render(res, {
                  code: err.code,
                  msg: err.msg,
                  pageInfo,
                  svcInfo
                });
              }
            );
          }
        },
        (err) => {
          this.error.render(res, {
            code: err.code,
            msg: err.msg,
            pageInfo,
            svcInfo
          });
        }
      );
  }

  private getCategoryList(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0051, { ifaqGrpCd: id }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    });
  }

  private getFaqList(res: Response, svcInfo: any, pageInfo: any, group: string, depth: number): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0052, {
      faqDepthGrpCd: group,
      faqDepthCd: depth,
      page: 0,
      size: 20
    }).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        return {
          list: resp.result.content,
          isLast: resp.result.last
        };
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    });
  }
}

export default CustomerFaqCategory;
