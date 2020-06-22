/**
 * @file customer.useguide.app.controller.ts
 * @author HJH
 * @since 2019-10-11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';

class CustomerUseGuideApp extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any,
         childInfo: any, pageInfo: any) {

    const id = req.query.id || '';
    
    this.getContent(res, svcInfo, pageInfo, id).subscribe(
      (content) => {
        if (!FormatHelper.isEmpty(content)) {
          // 조회 완료 시 컨텐츠관리 누적 조회 수 통계를 위한 API 발송
          this.setCount(res, svcInfo, pageInfo, id).subscribe( (count) => {
            res.render('useguide/customer.useguide.app.html', {
              svcInfo, pageInfo, content
            });
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
   * @desc contents를 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} id - 조회할 '이럴댄 이렇게 하세요' ID
   * @returns Observable
   */
  private getContent(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0064, {}, null, [id]).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
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


  /**
   * @function
   * @desc 컨텐츠관리의 앱이용가이드 조회수 count 누적
   * @para  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} id - 조회할 '이럴댄 이렇게 하세요' ID
   * @returns Observable
   */
  private setCount(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0065, {}, null, [id]).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return true;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    });
  } // end of getContent



}

export default CustomerUseGuideApp;
