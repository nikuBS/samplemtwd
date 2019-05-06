/**
 * @file customer.faq.do-like-this.controller.ts
 * @author Hakjoon sim
 * @since 2018-12-02
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';

class CustomerFaqDoLikeThis extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {
    const id = req.query.id;
    this.getContent(res, svcInfo, pageInfo, id).subscribe(
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
          pageInfo,
          svcInfo
        });
      }
    );
  }

  /**
   * @function
   * @desc 이럴땐 이렇게 하세요의 각 항목별 contents를 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} id - 조회할 '이럴댄 이렇게 하세요' ID
   * @returns Observable
   */
  private getContent(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0064, {}, null, [id]).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        // 조회 완료시 통계를 위한 API 발송
        this.apiService.request(API_CMD.BFF_08_0065, {}, null, [id]);
        return EnvHelper.replaceCdnUrl(resp.result.icntsCtt);
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

export default CustomerFaqDoLikeThis;
