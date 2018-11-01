/**
 * FileName: customer.branch.repair-detail.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.01
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

class CustomerBranchRepairDetail extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const code = req.query.code;
    this.getDetailInfo(res, svcInfo, code).subscribe(
      (detail: Detail) => {
        if (!!detail) {
          res.render('branch/customer.branch.repair-detail.html', { detail });
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

  private getDetailInfo(res: Response, svcInfo: any, code: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0055, { locCode: code })
      .map((resp) => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result;
        }

        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });

        return undefined;
      });
  }
}

export default CustomerBranchRepairDetail;
