/**
 * FileName: myt-data.recharge.coupon.complete.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.26
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

export default class MyTDataRechargeCouponComplete extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    const category = req.query.category;
    switch (category) {
      case 'data':
        res.render('recharge/myt-data.recharge.coupon-complete-data.html');
        break;
      case 'voice':
        res.render('recharge/myt-data.recharge.coupon-complete-voice.html');
        break;
      case 'gift':
        const number = req.query.number;
        this.getUsableCouponList(res, svcInfo, pageInfo).subscribe(
          (result) => {
            if (!FormatHelper.isEmpty(result)) {
              res.render('recharge/myt-data.recharge.coupon-complete-gift.html', {
                coupons: result.length,
                number: number
              });
            }
          },
          (err) => {
            this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
          }
        );
        break;
      default:
        break;
    }
  }

  private getUsableCouponList(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo
      });

      return null;
    });
  }
}
