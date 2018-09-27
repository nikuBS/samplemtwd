/**
 * FileName: myt-data.usage.refill.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_DATA_CHARGE_TYPE_NAMES as TypeNames, UNIT, MYT_DATA_CHARGE_BADGE_TYPES as BadgeTypeNames } from '../../../../types/string.type';

import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';

enum RechargeTypes {
  DATA_GIFT = 1,
  LIMIT_CHARGE,
  TING_CHARGE,
  TING_GIFT,
  REFILL_USAGE,
  REFILL_GIFT
}

interface ICharge {
  type: RechargeTypes;
  typeName: TypeNames;
  date: string;
  badge: {
    icon: BadgeTypes;
    text: BadgeTypeNames;
  };
  bottom?: string;
  right?: {
    amount: number | string;
    unit?: UNIT;
    color?: string;
  };
  refundable?: boolean;
  fixed?: boolean;
  refunded?: boolean;
}

interface IChargeData {
  [key: string]: { data: ICharge[]; count: number };
}

enum BadgeTypes {
  GIFT = 'gift',
  CHARGE = 'refill'
}

export default class MyTDataRechargeHistory extends TwViewController {
  private fromDt: string = DateHelper.getPastYearShortDate();
  private toDt: string = DateHelper.getShortDate(new Date());

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getDataGifts(),
      this.getLimitCharges(),
      this.getTingCharges(),
      this.getTingGifts(),
      this.getRefillUsages(),
      this.getRefillGifts()
    ).subscribe(([dataGifts, limitCharges, tingCharges, tingGifts, refillUsages, refillGifts]) => {
      const chargeData = this.mergeCharges(dataGifts, limitCharges, tingCharges, tingGifts, refillUsages, refillGifts);
      res.render('recharge/myt-data.recharge.history.html', { svcInfo, chargeData });
    });
  }

  private getDataGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0018, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      const data = resp.result;
      const result: IChargeData = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const key = item.opDt;
        const amount = Number(item.dataQty);

        if (!result[key]) {
          result[key] = { data: [], count: 0 };
        }

        result[key].data.push({
          type: RechargeTypes.DATA_GIFT,
          typeName: TypeNames.DATA_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          fixed: item.giftType === 'GC',
          badge: {
            icon: BadgeTypes.GIFT,
            text: BadgeTypeNames.GIFT
          },
          right:
            amount > 1000
              ? {
                  amount: '- ' + (amount / 1000).toFixed(1),
                  unit: UNIT.GB,
                  color: 'red'
                }
              : {
                  amount: '- ' + amount,
                  unit: UNIT.MB
                },
          bottom: item.svcNum
        });
        result[key].count++;
      }

      return result;
    });
  }

  private getLimitCharges = (): Observable<IChargeData | null> => {
    return this.apiService
      .request(API_CMD.BFF_06_0042, { fromDt: this.fromDt, toDt: this.toDt, type: 1 })
      .map((resp: { code: string; result: any }) => {
        if (resp.code !== API_CODE.CODE_00) {
          return null;
        }

        // const data = LIMIT_CHARGES.result;
        const data = resp.result;
        const result: IChargeData = {};
        for (let i = 0; i < data.length; i++) {
          const item = data[i];
          const key = item.opDt;

          if (!result[key]) {
            result[key] = { data: [], count: 0 };
          }

          result[key].data.push({
            type: RechargeTypes.LIMIT_CHARGE,
            typeName: TypeNames.LIMIT_CHARGE,
            date: DateHelper.getShortDateNoYear(key),
            refundable: item.opTypCd === '1' && this.toDt === key,
            badge: {
              icon: BadgeTypes.CHARGE,
              text: BadgeTypeNames.CHARGE
            },
            right: {
              amount: '+ ' + FormatHelper.addComma(item.amt),
              unit: UNIT.WON,
              color: 'blue'
            },
            bottom: item.opOrgNm
          });
          result[key].count++;
        }

        return result;
      });
  }

  private getTingCharges = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0032, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      const data = resp.result;
      const result: IChargeData = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const key = item.opDt;

        if (!result[key]) {
          result[key] = { data: [], count: 0 };
        }

        result[key].data.push({
          type: RechargeTypes.TING_CHARGE,
          typeName: TypeNames.TING_CHARGE,
          date: DateHelper.getShortDateNoYear(key),
          right: {
            amount: '+ ' + FormatHelper.addComma(item.amt),
            unit: UNIT.WON,
            color: item.opTypCd === '2' || item.opTypCd === '4' ? 'gray' : 'blue'
          },
          badge: {
            icon: BadgeTypes.CHARGE,
            text: BadgeTypeNames.CHARGE
          },
          refundable: item.refundableYn === 'Y',
          refunded: item.opTypCd === '2' || item.opTypCd === '4'
        });
        result[key].count++;
      }

      return result;
    });
  }

  private getTingGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0026, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      const data = resp.result;
      const result: IChargeData = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const key = item.opDt;

        if (!result[key]) {
          result[key] = { data: [], count: 0 };
        }

        result[key].data.push({
          type: RechargeTypes.TING_GIFT,
          typeName: TypeNames.TING_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          right: {
            amount: '- ' + FormatHelper.addComma(item.amt),
            unit: UNIT.WON,
            color: 'red'
          },
          badge: {
            icon: BadgeTypes.GIFT,
            text: BadgeTypeNames.GIFT
          },
          refunded: item.opTypCd === '2' || item.opTypCd === '4'
        });
        result[key].count++;
      }

      return result;
    });
  }

  private getRefillUsages = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      const data = resp.result;
      const result: IChargeData = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const key = item.copnUseDt;

        if (!result[key]) {
          result[key] = { data: [], count: 0 };
        }

        result[key].data.push({
          type: RechargeTypes.REFILL_USAGE,
          typeName: TypeNames.REFILL_USAGE,
          date: DateHelper.getShortDateNoYear(key),
          badge: {
            icon: BadgeTypes.CHARGE,
            text: BadgeTypeNames.CHARGE
          },
          right: {
            amount: item.copnDtlClNm,
            color: 'blue'
          }
        });
        result[key].count++;
      }

      return result;
    });
  }

  private getRefillGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0003, { type: 0 }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      const data = resp.result;
      const result: IChargeData = {};
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const key = item.copnOpDt;

        if (!result[key]) {
          result[key] = { data: [], count: 0 };
        }

        result[key].data.push({
          type: RechargeTypes.REFILL_GIFT,
          typeName: TypeNames.REFILL_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          badge: {
            icon: BadgeTypes.GIFT,
            text: BadgeTypeNames.GIFT
          },
          bottom: item.svcNum
        });
        result[key].count++;
      }

      return result;
    });
  }

  private mergeCharges = (...args: (IChargeData | null)[]): { data: IChargeData; count: number } => {
    const result: { data: IChargeData; count: number } = { data: {}, count: 0 };

    for (let i = 0; i < args.length; i++) {
      const data = args[i];

      if (!data) {
        continue;
      }

      for (const key of Object.keys(data)) {
        if (!result.data[key]) {
          result.data[key] = { data: [], count: 0 };
        }

        result.data[key].count += data[key].count;
        result.count += data[key].count;
        result.data[key].data = result.data[key].data.concat(data[key].data);
      }
    }

    return result;
  }
}
