/**
 * @file A/S 센터 상세정보 화면 처리
 * @author Hakjoon sim
 * @since 2018-11-01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Detail {
  locName: string;
  storeName: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  geoX: string;
  geoY: string;
}

class CustomerAgentsearchRepairDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    const code = req.query.code;
    this.getDetailInfo(res, svcInfo, pageInfo, code).subscribe(
      (detail: Detail) => {
        if (!!detail) {
          res.render('agentsearch/customer.agentsearch.repair-detail.html', {
            detail, svcInfo, pageInfo
          });
        }
      },
      (err) => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }
    );
  }

  /**
   * @function
   * @desc A/S센터 상세 정보를 BFF로 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} code - 조회하고자 하는 A/S센터 코드
   * @returns Observable - 조회한 Response
   */
  private getDetailInfo(res: Response, svcInfo: any, pageInfo: any, code: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0055, { locCode: code })
      .map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result;
        }

        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });

        return undefined;
      });
  }
}

export default CustomerAgentsearchRepairDetail;
