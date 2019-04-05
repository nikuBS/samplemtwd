/**
 * FileName: myt-data.recharge.coupon.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.09.17
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_RECHARGE_COUPON } from '../../../../types/string.type';

interface Coupon {
  copnIsueNum: string;
  copnNm: string;
  usePsblStaDt: string;
  usePsblEndDt: string;
  copnOperStCd: string;
  copnIsueDt: string;
  isGift?: boolean;
}

export default class MyTDataRechargeCoupon extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    Observable.combineLatest(
      this.getUsableCouponList(res, svcInfo, pageInfo), this.getAvailability(res, svcInfo, pageInfo)).subscribe(
        ([coupons, available]) => {
          if (coupons !== null && !FormatHelper.isEmpty(available)) {
            res.render('recharge/myt-data.recharge.coupon.html', {
              svcInfo,
              pageInfo,
              list: coupons,
              name: svcInfo.mbrNm,
              product: svcInfo.prodNm,
              available
            });
          }
        },
        (err) => {
          this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
        }
      );
  }

  private getUsableCouponList(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyCouponData(resp.result);
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

  private getAvailability(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        if (FormatHelper.isEmpty(resp.result.option)) {
          return 'NONE';
        }

        const available: string = resp.result.option.reduce((memo, item) => {
          return (memo + item.dataVoiceClCd);
        }, '');

        if (available.includes('D') && available.includes('V')) {
          return 'ALL';
        }
        if (available.includes('D')) {
          return 'DATA';
        }
        return 'VOICE';
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

  private purifyCouponData(data: Array<Coupon>): Array<Coupon> {
    return data.map((item) => {
      item.usePsblStaDt = DateHelper.getShortDate(item.usePsblStaDt);
      item.usePsblEndDt = DateHelper.getShortDate(item.usePsblEndDt);
      item.isGift = item.copnOperStCd === 'A20';  // A20: 선물, A10: 장기가입, A14: 10년주기
      item.copnNm = MYT_DATA_RECHARGE_COUPON[item.copnOperStCd];
      return item;
    });
  }


  private renderCouponComplete(req: Request, res: Response, svcInfo: any, pageInfo: any, category: string): void {
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
          (resp) => {
            if (resp.code === API_CODE.CODE_00) {
              res.render('recharge/myt-data.recharge.coupon-complete-gift.html', {
                coupons: resp.result.length,
                number: number
              });
            } else {
              this.showError(res, svcInfo, pageInfo, '리필 쿠폰 사용', resp.code, resp.msg);
            }
          },
          (err) => {
            this.showError(res, svcInfo, pageInfo, '리필 쿠폰 사용', err.code, err.msg);
          }
        );
        break;
      default:
        break;
    }
  }

  private showError(res: Response, svcInfo: any, pageInfo: any, title: string, code: string, msg: string): void {
    this.error.render(res, {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      title: title,
      code: code,
      msg: msg
    });
  }
}
