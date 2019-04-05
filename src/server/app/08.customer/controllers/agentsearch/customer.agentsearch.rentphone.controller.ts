/**
 * @file customer.agentsearch.rentphone.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2019.2.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Store {
  locName: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  locCode: string;
  geoX: string;
  geoY: string;
  orderDistrict: string;
}

class CustomerAgentsearchRentPhone extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    this.getRentPhoneStores(res, svcInfo, pageInfo).subscribe(
      (resp: Array<Store> | null) => {
        if (resp) {
          const currentList = resp.filter((item) => { // default 서울 지역만 filter
            return item.orderDistrict === '1';
          });
          res.render('agentsearch/customer.agentsearch.rentphone.html', {
            svcInfo, pageInfo, list: currentList, totalList: resp
          });
        }
      },
      err => {
        this.error.render(res, {
          code: err.code,
          msg: err.msg,
          pageInfo,
          svcInfo
        });
      }
    );
  }

  private getRentPhoneStores(res: Response, svcInfo: any, pageInfo: any): Observable<Array<Store> | null> {
    return this.apiService.request(API_CMD.BFF_08_0067, {}).map(((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.regionInfoList;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo,
        svcInfo
      });

      return null;
    }));
  }
}

export default CustomerAgentsearchRentPhone;
