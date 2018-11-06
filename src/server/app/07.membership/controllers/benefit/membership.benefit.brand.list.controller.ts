/*
 * FileName: membership.benefit.brand.list.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MembershipBenefitBrandList extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, child: any, pageInfo: any) {

    // Mocked resposne
    const data = {
      totalCnt: '121'
    };

    res.render('benefit/membership.benefit.brand.list.html', {
      svcInfo,
      pageInfo,
      data
    });
  }

  // TODO: Joon Once api spec done, retrieve list from the BFF
  private getFranchiseeList(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0022, {

    }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {

      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo
        });
      }
    });
  }
}

export default MembershipBenefitBrandList;
