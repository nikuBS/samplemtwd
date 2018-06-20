import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';
import { UNIT, UNIT_E } from '../../../types/bff-common.type';
import DateHelper from '../../../utils/date.helper';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';

class HomeMain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const remainDate = DateHelper.getRemainDate();

    Observable.combineLatest(
      this.getUsageData(),
      this.getRefillData()
    ).subscribe(([usageData, refillData]) => {
      const data = {
        svcInfo,
        remainDate,
        usageData,
        refillData
      };
      console.log(data);
      res.render('home.main.html', data);
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
      return usageData;
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

  // 리필
  private getRefillData(): Observable<any> {
    return Observable.combineLatest(
      this.getRefillCoupon(),
      this.getRefillOptions(),
      this.getRefillUsages(),
      (refillCoupon, refillOptions, refillUsages) => {
        return { refillCoupon, refillOptions, refillUsages, refillHistory: true };
      });
  }

  private getRefillCoupon(): Observable<any> {
    // 리필쿠폰 리스트
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return this.parseRefillCoupon(resp.result);
      }
      return null;
    });
  }

  private parseRefillCoupon(refillCoupon): any {
    if ( !FormatHelper.isEmpty(refillCoupon) ) {
      refillCoupon.map((coupon, index) => {
        coupon.backColor = (index + 2) % 2 + 1;
        coupon.showCopnIsueDt = DateHelper.getShortDateNoDot(coupon.copnIsueDt);
        coupon.showUsePsblStaDt = DateHelper.getShortDateNoDot(coupon.usePsblStaDt);
        coupon.showUsePsblEndDt = DateHelper.getShortDateNoYear(coupon.usePsblEndDt);
        coupon.showRemainDate = DateHelper.getNewRemainDate(coupon.usePsblEndDt);
      });
    }
    return refillCoupon;
  }

  private getRefillOptions(): Observable<any> {
    // 리필 가능 항목 (요금제 가족선물)
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  private getRefillUsages(): Observable<any> {
    // 리필쿠폰 사용 이력
    return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;

    });
  }

  // 선물
}

export default HomeMain;
