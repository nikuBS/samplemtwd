/**
 * FileName: customer.agentsearch.repair.controller.ts (CS_03_01)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.11.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

interface Centre {
  locName: string;
  searchAddr: string;
  jibunAddr: string;
  tel: string;
  locCode: string;
  geoX: string;
  geoY: string;
  orderDistrict: string;
}

class CustomerAgentsearchRepair extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any): void {
    this.getRepairShopList(res, svcInfo, pageInfo).subscribe(
      (result: Array<Centre>) => {
        if (!!result) {
          res.render('agentsearch/customer.agentsearch.repair.html', {
            centres: [
              result.filter((item) => item.orderDistrict === '1'),  // 서울
              result.filter((item) => item.orderDistrict === '2'),  // 경기
              result.filter((item) => item.orderDistrict === '3'),  // 강원
              result.filter((item) => item.orderDistrict === '4'),  // 경상
              result.filter((item) => item.orderDistrict === '5'),  // 전라/충청
              result.filter((item) => item.orderDistrict === '6')   // 제주
            ],
            svcInfo, pageInfo
          });
        }
      },
      (err) => {
        this.error.render(res, {
          title: '매장 및 AS 센터',
          code: err.code,
          msg: err.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    );
  }

  private getRepairShopList(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0049, {})
      .map((resp)  => {
        if (resp.code === API_CODE.CODE_00) {
          return resp.result;
        }

        this.error.render(res, {
          title: '매장 및 AS 센터',
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });

        return undefined;
      });
  }
}

export default CustomerAgentsearchRepair;
