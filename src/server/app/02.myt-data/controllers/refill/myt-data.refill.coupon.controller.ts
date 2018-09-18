/**
 * FileName: myt-data.refill.coupon.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.09.17
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

interface Coupon {
  copnIsueNum: string;
  copnNm: string;
  usePsblStaDt: string;
  usePsblEndDt: string;
  copnOperStCd: string;
  copnIsueDt: string;
}

export default class MytDataRefillCoupon extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.getUsableCouponList().subscribe(
      (resp) => {
        if (resp.code === API_CODE.CODE_00) {
          resp.result = this.purifyCouponData(resp.result);
          res.render('refill/myt-data.refill.coupon.html', {
            svcInfo: svcInfo,
            list: resp.result
          });
        } else {
          this.showError(res, svcInfo, resp.code, resp.msg);
        }
      },
      (err) => {
        this.showError(res, svcInfo, err.code, err.msg);
      });
  }

  private getUsableCouponList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {});
  }

  private purifyCouponData(data: Array<Coupon>): Array<Coupon> {
    return data.map((item) => {
      item.usePsblStaDt = DateHelper.getShortDateNoDot(item.usePsblStaDt);
      item.usePsblEndDt = DateHelper.getShortDateNoDot(item.usePsblEndDt);
      return item;
    });
  }

  private showError(res: Response, svcInfo: any, code: string, msg: string): void {
    this.error.render(res, {
      svcInfo: svcInfo,
      title: '나의 리필쿠폰',
      code: code,
      msg: msg
    });
  }
}
