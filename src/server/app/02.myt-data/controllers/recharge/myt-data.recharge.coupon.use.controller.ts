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
import { DATA_UNIT, TIME_UNIT, MYT_DATA_RECHARGE_COUPON } from '../../../../types/string.type';
import { REDIS_KEY } from '../../../../types/redis.type';
import DateHelper from '../../../../utils/date.helper';

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
interface Coupon {
  copnIsueNum: string;
  copnNm: string;
  usePsblStaDt: string;
  usePsblEndDt: string;
  copnOperStCd: string;
  copnIsueDt: string;
  isGift?: boolean;
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
    ['NA00005957', 15], // T plan large
    ['NA00005958', 20], // T plan family
    ['NA00006157', 20] // 0 plan large
  ]);

  private planAdaptive = {  // 맞춤형 요금제 - '요금상품별 상이' 표기
    'NA00004153': true,
    'NA00004154': true,
    'NA00004155': true,
    'NA00004156': true,
    'NA00004157': true,
    'NA00004158': true,
    'NA00003310': true,
    'NA00004098': true,
    'NA00004099': true,
    'NA00004100': true,
    'NA00004101': true,
    'NA00004102': true,
    'NA00004145': true,
    'NA00003517': true,
    'NA00003518': true,
    'NA00003519': true,
    'NA00003520': true,
    'NA00003521': true
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    let no: string, name: string, period: string, tab: string, isGift: boolean;
    const auto = req.query.auto === 'Y';
    if (auto) {
      this.getMostSuitableCoupon(res, svcInfo, pageInfo)
        .subscribe(
          (coupon: Coupon) => {
            if (coupon) {
              no = coupon.copnIsueNum;
              name = coupon.copnNm;
              period = coupon.usePsblStaDt + '~' + coupon.usePsblEndDt;
              tab = 'refill';
              isGift = coupon.isGift || false;
              this.renderCouponUse(res, svcInfo, pageInfo, no, name, period, tab, isGift, auto);
            } else {
              this.error.render(res, { code: '', msg: '', pageInfo, svcInfo });
            }
          },
          err => {
            this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
          }
        );
      return;
    } else {
      no = req.query.no;
      name = req.query.name;
      period = req.query.period;
      tab = req.query.tab;
      isGift = req.query.gift === 'Y' ? true : false;
    }

    this.renderCouponUse(res, svcInfo, pageInfo, no, name, period, tab, isGift, auto);

  }

  private renderCouponUse(res: Response, svcInfo: any, pageInfo: any, no: string, name: string,
                          period: string, tab: string, isGift: boolean, isAuto: boolean) {
    Observable.combineLatest(
      this.getCouponUsageOptions(res, svcInfo, pageInfo),
      this.getRedisProductInfo(res, svcInfo, pageInfo, svcInfo.prodId)
    ).subscribe(
      ([couponUsage, productSummary]) => {
        if (!FormatHelper.isEmpty(couponUsage) && !FormatHelper.isEmpty(productSummary)) {
          const options = this.purifyCouponOptions(couponUsage, productSummary, svcInfo.prodId);
          res.render('recharge/myt-data.recharge.coupon-use.html', {
            no, name, period, tab, options, isGift, isAuto, pageInfo
          });
        }
      },
      (err) => {
        this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
      }
    );
  }

  private getCouponUsageOptions(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.option;
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

  private getRedisProductInfo(res: Response, svcInfo: any, pageInfo: any, prodId: any): Observable<any> {
    return this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId).map(resp => {
      if (!FormatHelper.isEmpty(resp.result)) {
        return resp.result.summary;
      }

      this.error.render(res, { code: resp.code, msg: resp.msg, pageInfo, svcInfo });
      return null;
    });
  }

  private getMostSuitableCoupon(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
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

  private purifyCouponData(data: Array<Coupon>): Coupon | null {
    if (data.length === 0) {
      return null;
    }

    let coupons = data.filter((coupon: Coupon) => {  // 1순위 선물받은쿠폰 있는지 확인
      return coupon.copnOperStCd === 'A20';
    });

    if (coupons.length === 0) { // 2순위 장기가입 쿠폰 있는지 확인
      coupons = data.filter((coupon: Coupon) => {
        return coupon.copnOperStCd === 'A10';
      });
    }

    if (coupons.length === 0) {
      coupons = data;
    }

    // 만료일자가 가장 빠른 쿠폰 선택
    let pick = 0;
    for (let i = 1; i < coupons.length; i += 1) {
      if (coupons[i].usePsblEndDt < coupons[pick].usePsblEndDt) {
        pick = i;
      }
    }

    coupons[pick].usePsblStaDt = DateHelper.getShortDate(coupons[pick].usePsblStaDt);
    coupons[pick].usePsblEndDt = DateHelper.getShortDate(coupons[pick].usePsblEndDt);
    coupons[pick].isGift = coupons[pick].copnOperStCd === 'A20';  // A20: 선물, A10: 장기가입, A14: 10년주기
    coupons[pick].copnNm = MYT_DATA_RECHARGE_COUPON[coupons[pick].copnOperStCd];

    return coupons[pick];
  }

  private purifyCouponOptions(options: Array<Option>, productInfo: Product,
                              plan: string): Array<Option> {
    return options.map((option) => {
      option.copnDtlClNm += ' ';
      if (this.planType.has(plan)) {
        if (this.planType.get(plan) === 0) {
          option.qttText = '0';
          return option;
        } else if (option.dataVoiceClCd === 'D') {
          const converted = FormatHelper.convDataFormat(this.planType.get(plan), DATA_UNIT.GB);
          option.qttText = converted.data + ' ' + converted.unit;
          if (plan === 'NA00005957' || plan === 'NA00005958' || plan === 'NA00006157') { // Tplan large/family의 경우 '최대' 삽입, 0Plan large 포함
            option.qttText = '최대 ' + option.qttText;
            option.copnDtlClNm = option.copnDtlClNm.replace('100%', '').trim();
          }
          option.isTplan = true;
          return option;
        }
      } else if (this.planAdaptive[plan]) {
        if (option.dataVoiceClCd === 'D') {
          option.qttText = '요금상품별 상이';
          return option;
        }
      }

      if (option.dataVoiceClCd === 'D') {
        const offer = productInfo.basOfrGbDataQtyCtt ?
          productInfo.basOfrGbDataQtyCtt : productInfo.basOfrMbDataQtyCtt;
        const unit = productInfo.basOfrGbDataQtyCtt ? DATA_UNIT.GB : DATA_UNIT.MB;
        const converted = FormatHelper.convDataFormat(offer, unit);
        option.qttText = converted.data + ' ' + converted.unit;
      } else {
        option.qttText = '0'; // Do not show voice amount that expected
      }
      return option;
    });
  }
}
