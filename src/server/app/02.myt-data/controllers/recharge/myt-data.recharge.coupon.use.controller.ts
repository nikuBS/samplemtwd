/**
 * FileName: myt-data.recharge.coupon.use.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.26
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT, TIME_UNIT } from '../../../../types/string.type';
import { REDIS_KEY } from '../../../../types/redis.type';

interface Option {
  dataVoiceClCd: string;
  copnDtlClCd: string;
  copnDtlClNm: string;
  ofrRt: string;
  qttText?: string;
  isTplan?: boolean;
}

interface Product {
  basOfrGbDataQtyCtt: string;
  basOfrMbDataQtyCtt: string;
  basOfrVcallTmsCtt: string;
  basOfrCharCntCtt: string;
  basFeeInfo: string;
}

export default class MyTDataRechargeCouponUse extends TwViewController {

  private planType: Map<string, number> = new Map([
    ['NA00004098', 0],
    ['NA00004099', 0],
    ['NA00004100', 0],
    ['NA00004101', 0],
    ['NA00004145', 0],
    ['NA00004102', 0],
    ['NA00004705', 0],
    ['NA00005957', 15],
    ['NA00005958', 20],
    ['NA00006155', 15]
  ]);

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    const no = req.query.no;
    const name = req.query.name;
    const period = req.query.period;
    const tab = req.query.tab;
    const isGift = req.query.gift === 'Y' ? true : false;

    Observable.combineLatest(
      this.getCouponUsageOptions(res, svcInfo),
      this.getRedisProductInfo(res, svcInfo, svcInfo.prodId)
    ).subscribe(
      ([couponUsage, productSummary]) => {
        if (!FormatHelper.isEmpty(couponUsage) && !FormatHelper.isEmpty(productSummary)) {
          const options = this.purifyCouponOptions(couponUsage, productSummary, svcInfo.prodId);
          res.render('recharge/myt-data.recharge.coupon-use.html', {
            no, name, period, tab, options, isGift, pageInfo
          });
        }
      },
      (err) => {
        this.error.render(res, { code: err.code, msg: err.msg, svcInfo });
      }
    );
  }

  private getCouponUsageOptions(res: Response, svcInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.option;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        svcInfo
      });
      return null;
    });
  }

  private getRedisProductInfo(res: Response, svcInfo: any, prodId: any): Observable<any> {
    return this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId).map(resp => {
      if (!FormatHelper.isEmpty(resp.result)) {
        return resp.result.summary;
      }

      this.error.render(res, { code: resp.code, msg: resp.msg, svcInfo });
      return null;
    });
  }

  private purifyCouponOptions(options: Array<Option>, productInfo: Product,
                              plan: string): Array<Option> {
    return options.map((option) => {
      if (this.planType.has(plan)) {
        if (this.planType.get(plan) === 0) {
          option.qttText = '0';
          return option;
        } else if (option.dataVoiceClCd === 'D') {
          const converted = FormatHelper.convDataFormat(this.planType.get(plan), DATA_UNIT.GB);
          option.qttText = converted.data + ' ' + converted.unit;
          option.isTplan = true;
          return option;
        }
      }
      if (option.dataVoiceClCd === 'D') {
        const converted = FormatHelper.convDataFormat(productInfo.basOfrGbDataQtyCtt, DATA_UNIT.GB);
        option.qttText = converted.data + ' ' + converted.unit;
      } else {
        option.qttText = '0'; // Do not show voice amount that expected
      }
      return option;
    });
  }
}
