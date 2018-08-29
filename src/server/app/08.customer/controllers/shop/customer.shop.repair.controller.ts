/**
 * FileName: customer.shop.repair.controller.ts (CI_03_01)
 * Author: Hakjoon Sim(hakjoon.sim@sk.com)
 * Date: 2018.08.01
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

class CustomerShopRepair extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    this.getRepairShopList().subscribe(
      (result) => {
        // 1: 서울, 2. 경기, 3:강원도, 4: 부산, 울산, 경남, 경북, 대구
        // 5: 광주, 전남, 전북, 대전, 충남, 충북 6: 제주
        res.render('./shop/customer.shop.repair.html', {
          svcInfo: svcInfo,
          region1: result.filter((item) => item.orderDistrict === '1'),  // 서울
          region2: result.filter((item) => item.orderDistrict === '2'),  // 경기
          region4: result.filter((item) => item.orderDistrict === '4'),  // 경상
          region5: result.filter((item) => item.orderDistrict === '5'),  // 전라/충청
        });
      },
      (err) => {
        this.error.render(res, {
          title: '매장 및 AS 센터',
          code: err.code,
          msg: err.msg,
          svcInfo: svcInfo
        });
      }
    );
  }

  private getRepairShopList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0049, {})
      .map((res) => {
        if (res.code === API_CODE.CODE_00) {
          return res.result;
        }
      });
  }
}

export default CustomerShopRepair;
