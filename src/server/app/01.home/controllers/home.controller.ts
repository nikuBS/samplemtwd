/**
 * FileName: home.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { LINE_NAME, SVC_ATTR_E, UNIT, UNIT_E } from '../../../types/bff.type';

class Home extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any) {
    const svcType = this.getSvcType(svcInfo);
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null
    };

    if ( svcType.login ) {
      if ( svcType.mobile ) {
        Observable.combineLatest(
          this.getUsageData(),
          this.getMembershipData()
        ).subscribe(([usageData, membershipData]) => {
          homeData.usageData = usageData;
          homeData.membershipData = membershipData;
        });
      } else if ( svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ) {
        this.getBillData().subscribe((resp) => {
          homeData.billData = resp;
        });
      } else {
        this.getUsageData().subscribe((resp) => {
          homeData.usageData = resp;
        });
      }
    }

    res.render('home.html', { svcInfo, svcType, homeData });
  }

  private getSvcType(svcInfo): any {
    const svcType = {
      svcCategory: LINE_NAME.MOBILE,
      mobile: false,
      login: false
    };

    if ( !FormatHelper.isEmpty(svcInfo) ) {
      svcType.login = true;
      if ( svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
        svcType.mobile = true;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.INTERNET || svcInfo.svcAttrCd === SVC_ATTR_E.IPTV || svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE ) {
        svcType.svcCategory = LINE_NAME.INTERNET_PHONE_IPTV;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.POINT_CAM ) {
        svcType.svcCategory = LINE_NAME.SECURITY;
      }
    }

    return svcType;
  }

  private getMembershipData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_04_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
      }
      return resp.result;
    });
  }

  private getBillData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0036, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {

      }
      return resp.result;
    });
  }

  // 사용량 조회
  private getUsageData(): Observable<any> {
    let usageData = {
      prodName: null
    };
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = this.parseUsageData(resp.result);
      }
      return resp.result;
    });
  }


  private parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms'];

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData.main[kind]) ) {
        this.convShowData(usageData.main[kind]);
      }
    });
    return usageData;
  }

  private convShowData(data: any) {
    data.isUnlimit = !isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = data.remained / data.total * 100;
    }
  }

  private convFormat(data: string, unit: string): string {
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }

  // // 리필
  // private getRefillData(): Observable<any> {
  //   return Observable.combineLatest(
  //     this.getRefillCoupon(),
  //     this.getRefillOptions(),
  //     this.getRefillUsages(),
  //     (refillCoupon, refillOptions, refillUsages) => {
  //       return { refillCoupon, refillOptions, refillUsages };
  //     });
  // }
  //
  // private getRefillCoupon(): Observable<any> {
  //   // 리필쿠폰 리스트
  //   return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
  //     if ( resp.code === API_CODE.CODE_00 ) {
  //       return this.parseRefillCoupon(resp.result);
  //     }
  //     return null;
  //   });
  // }
  //
  // private parseRefillCoupon(refillCoupon): any {
  //   if ( !FormatHelper.isEmpty(refillCoupon) ) {
  //     refillCoupon.map((coupon, index) => {
  //       coupon.backColor = (index + 2) % 2 + 1;
  //       coupon.showCopnIsueDt = DateHelper.getShortDateNoDot(coupon.copnIsueDt);
  //       coupon.showUsePsblStaDt = DateHelper.getShortDateNoDot(coupon.usePsblStaDt);
  //       coupon.showUsePsblEndDt = DateHelper.getShortDateNoYear(coupon.usePsblEndDt);
  //       coupon.showRemainDate = DateHelper.getNewRemainDate(coupon.usePsblEndDt);
  //       coupon.query = `copnNm=${coupon.copnIsueNum}&endDt=${coupon.usePsblEndDt}`;
  //     });
  //   }
  //   return refillCoupon;
  // }
  //
  // private getRefillOptions(): Observable<any> {
  //   // 리필 가능 항목 (요금제 가족선물)
  //   return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
  //     if ( resp.code === API_CODE.CODE_00 ) {
  //       return this.parseRefillOption(resp.result);
  //     }
  //     return null;
  //   });
  // }
  //
  // private parseRefillOption(option): any {
  //   option.condition.usedCopnCntTmth = +option.condition.usedCopnCntTmth;
  //   option.condition.usableCopnCntTmth = +option.condition.usableCopnCntTmth;
  //   option.condition.transferedCopnCnt = +option.condition.transferedCopnCnt;
  //   option.condition.transferableCopnCnt = +option.condition.transferableCopnCnt;
  //   option.condition.transferedCopnCntTmth = +option.condition.transferedCopnCntTmth;
  //   option.condition.transferableCopnCntTmth = +option.condition.transferableCopnCntTmth;
  //
  //   return option;
  // }
  //
  // private getRefillUsages(): Observable<any> {
  //   // 리필쿠폰 사용 이력
  //   return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp) => {
  //     if ( resp.code === API_CODE.CODE_00 ) {
  //       return resp.result;
  //     }
  //     return null;
  //
  //   });
  // }
  //
  // // 선물
  // private getGiftData(): Observable<any> {
  //   return Observable.combineLatest(
  //     this.getGiftSender(),
  //     (giftSender) => {
  //       return { giftSender };
  //     });
  //
  // }
  //
  // private getGiftSender(): Observable<any> {
  //   return this.apiService.request(API_CMD.BFF_06_0015, {}).map(resp => {
  //     if ( resp.code === API_CODE.CODE_00 ) {
  //       resp.result.code = resp.code;
  //       return resp.result;
  //     } else if ( API_GIFT_ERROR.indexOf(resp.code) !== -1 ) {
  //       return { code: resp.code };
  //     }
  //     return null;
  //   });
  // }
}

export default Home;
