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
import { DATA_UNIT, TIME_UNIT } from '../../../../types/string.type';

interface Coupon {
  copnIsueNum: string;
  copnNm: string;
  usePsblStaDt: string;
  usePsblEndDt: string;
  copnOperStCd: string;
  copnIsueDt: string;
}
interface Option {
  dataVoiceClCd: string;
  copnDtlClCd: string;
  copnDtlClNm: string;
  ofrRt: string;
  qttText?: string;
}

interface Product {
  basOfrDataQtyCtt: string;
  basOfrVcallTmsCtt: string;
  basOfrCharCntCtt: string;
  basFeeInfo: string;
}

export default class MyTDataRechargeCoupon extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;

    switch (page) {
      case 'complete':
        const category = req.query.category;
        this.renderCouponComplete(res, category);
        break;
      case 'use':
        const couponNo = req.query.no;
        const couponName = req.query.name;
        const couponPeriod = req.query.period;
        const tab = req.query.tab;
        this.renderCouponUse(res, svcInfo, tab, couponNo, couponName, couponPeriod);
        break;
      default:
        this.renderCouponList(res, svcInfo);
    }
  }

  private renderCouponUse(res: Response, svcInfo: any, tab: string, no: string, name: string,
                          period: string): void {

    const error = (code, msg) => {
      this.showError(res, svcInfo, '리필 쿠폰 사용', code, msg);
    };

    this.getCouponUsageOptions().subscribe(
      (resp) => {
        if (resp.code === API_CODE.CODE_00) {
          this.apiService.request(API_CMD.BFF_10_0002, {}, {}, svcInfo.prodId).subscribe(
            (productInfo) => {
              if (productInfo.code === API_CODE.CODE_00) {
                const purifiedOptions =
                  this.purifyCouponOptions(resp.result.option, productInfo.result);
                res.render('recharge/myt-data.recharge.coupon-use.html', {
                  no: no,
                  name: name,
                  period: period,
                  tab: tab,
                  options: purifiedOptions
                });
              } else {
                error(productInfo.code, productInfo.msg);
              }
            },
            (err) => {
              error(err.code, err.msg);
            });
        } else {
          error(resp.code, resp.msg);
        }
      },
      (err) => {
        error(err.code, err.msg);
      }
    );
  }

  private renderCouponComplete(res: Response, category: string): void {
    switch (category) {
      case 'data':
        res.render('recharge/myt-data.recharge.coupon-complete-data.html');
        break;
      case 'voice':
        res.render('recharge/myt-data.recharge.coupon-complete-voice.html');
        break;
      case 'gift':
        // TODO: display gift detail
        res.render('recharge/myt-data.recharge.coupon-complete-gift.html');
        break;
      default:
        break;
    }
  }

  private renderCouponList(res: Response, svcInfo: any): void {
    this.getUsableCouponList().subscribe(
      (resp) => {
        if (resp.code === API_CODE.CODE_00) {
          resp.result = this.purifyCouponData(resp.result);
          res.render('recharge/myt-data.recharge.coupon.html', {
            svcInfo: svcInfo,
            list: resp.result
          });
        } else {
          this.showError(res, svcInfo, '나의 리필쿠폰', resp.code, resp.msg);
        }
      },
      (err) => {
        this.showError(res, svcInfo, '나의 리필쿠폰', err.code, err.msg);
      });
  }

  private getUsableCouponList(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {});
  }

  private getCouponUsageOptions(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {});
  }

  private purifyCouponData(data: Array<Coupon>): Array<Coupon> {
    return data.map((item) => {
      item.usePsblStaDt = DateHelper.getShortDateNoDot(item.usePsblStaDt);
      item.usePsblEndDt = DateHelper.getShortDateNoDot(item.usePsblEndDt);
      return item;
    });
  }

  private purifyCouponOptions(options: Array<Option>, productInfo: Product): Array<Option> {
    return options.map((option) => {
      if (option.dataVoiceClCd === 'D') {
        const converted = FormatHelper.convDataFormat(productInfo.basOfrDataQtyCtt, DATA_UNIT.GB);
        option.qttText = converted.data + ' ' + converted.unit;
      } else {
        let calculated = parseInt(productInfo.basOfrVcallTmsCtt, 10) * 0.2;
        calculated = Math.round(calculated);
        option.qttText = calculated + ' ' + TIME_UNIT.MINUTE;
      }
      return option;
    });
  }

  private showError(res: Response, svcInfo: any, title: string, code: string, msg: string): void {
    this.error.render(res, {
      svcInfo: svcInfo,
      title: title,
      code: code,
      msg: msg
    });
  }
}
