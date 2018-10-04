/**
 * FileName: myt-data.usage.refill.history.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.09.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Rx';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_DATA_CHARGE_TYPE_NAMES as TypeNames, UNIT, MYT_DATA_CHARGE_TYPES as ChargeTypeNames } from '../../../../types/string.type';

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
    text: ChargeTypeNames;
  };
  bottom?: string[];
  right?: {
    amount: number | string;
    type?: string;
    unit?: UNIT;
    color?: string;
  };
  refundable?: boolean;
}

interface IChargeData {
  [key: string]: ICharge[];
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
    ).subscribe(histories => {
      res.render('recharge/myt-data.recharge.history.html', { svcInfo, chargeData: this.mergeCharges(histories) });
    });
  }

  private getDataGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0018, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      return resp.result.reduce((nData: IChargeData, item) => {
        const key = item.opDt;
        const amount = Number(item.dataQty);

        if (!nData[key]) {
          nData[key] = [];
        }

        nData[key].push({
          type: RechargeTypes.DATA_GIFT,
          typeName: TypeNames.DATA_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          badge: {
            icon: BadgeTypes.GIFT,
            text: ChargeTypeNames.GIFT
          },
          right:
            amount > 1000
              ? {
                  amount: (amount / 1000).toFixed(1),
                  unit: UNIT.GB,
                  color: item.type === '1' ? 'red' : 'blue'
                }
              : {
                  amount: amount,
                  unit: UNIT.MB,
                  color: item.type === '1' ? 'red' : 'blue'
                },
          bottom: item.giftType === 'GC' ? [item.svcNum, ChargeTypeNames.FIXED] : [item.svcNum]
        });

        return nData;
      }, {});
    });
  }

  private getLimitCharges = (): Observable<IChargeData | null> => {
    return this.apiService
      .request(API_CMD.BFF_06_0042, { fromDt: this.fromDt, toDt: this.toDt, type: 1 })
      .map((resp: { code: string; result: any }) => {
        if (resp.code !== API_CODE.CODE_00) {
          return null;
        }

        return resp.result.reduce((nData: IChargeData, item) => {
          const key = item.opDt;

          if (!nData[key]) {
            nData[key] = [];
          }

          nData[key].push({
            type: RechargeTypes.LIMIT_CHARGE,
            typeName: TypeNames.LIMIT_CHARGE,
            date: DateHelper.getShortDateNoYear(key),
            refundable: item.opTypCd === '1' && this.toDt === key,
            badge: {
              icon: BadgeTypes.CHARGE,
              text: ChargeTypeNames.CHARGE
            },
            right: {
              amount: FormatHelper.addComma(item.amt),
              unit: UNIT.WON,
              color: 'blue'
            },
            bottom: [item.opOrgNm]
          });

          return nData;
        }, {});
      });
  }

  private getTingCharges = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0032, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      return resp.result.reduce((nData: IChargeData, item) => {
        const key = item.opDt;

        if (!nData[key]) {
          nData[key] = [];
        }

        nData[key].push({
          type: RechargeTypes.TING_CHARGE,
          typeName: TypeNames.TING_CHARGE,
          date: DateHelper.getShortDateNoYear(key),
          right: {
            amount: FormatHelper.addComma(item.amt),
            unit: UNIT.WON,
            color: item.opTypCd === '2' || item.opTypCd === '4' ? 'gray' : 'blue'
          },
          badge: {
            icon: BadgeTypes.CHARGE,
            text: ChargeTypeNames.CHARGE
          },
          refundable: item.refundableYn === 'Y',
          bottom: item.opTypCd === '2' || item.opTypCd === '4' ? [item.opTypNm, ChargeTypeNames.CANCLE] : [item.opTypNm]
        });

        return nData;
      }, {});
    });
  }

  private getTingGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0026, { fromDt: this.fromDt, toDt: this.toDt }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      return resp.result.reduce((nData: IChargeData, item) => {
        const key = item.opDt;

        if (!nData[key]) {
          nData[key] = [];
        }

        nData[key].push({
          type: RechargeTypes.TING_GIFT,
          typeName: TypeNames.TING_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          right: {
            amount: FormatHelper.addComma(item.amt),
            unit: UNIT.WON,
            color: item.opTypCd === '1' ? 'red' : 'blue'
          },
          badge: {
            icon: BadgeTypes.GIFT,
            text: ChargeTypeNames.GIFT
          },
          bottom: item.opTypCd === '2' || item.opTypCd === '4' ? [item.opTypNm, ChargeTypeNames.CANCLE] : [item.opTypNm]
        });

        return nData;
      }, {});
    });
  }

  private getRefillUsages = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      return resp.result.reduce((nData: IChargeData, item) => {
        const key = item.copnUseDt;

        if (!nData[key]) {
          nData[key] = [];
        }

        let subIdx = 0;

        switch (item.copnDtlClCd) {
          case 'AAA21': // 망내음성 20%
          case 'AAA22': // 망외음성 20%
            subIdx = 5;
            break;
          case 'AAA10': // 데이터 100%
          case 'AAA30': // 데이터 무제한
            subIdx = 4;
            break;
          case 'AAA20': // 음성 20%
          case 'AAA40': // 음성 무제한
            subIdx = 3;
            break;
        }

        nData[key].push({
          type: RechargeTypes.REFILL_USAGE,
          typeName: TypeNames.REFILL_USAGE,
          date: DateHelper.getShortDateNoYear(key),
          badge: {
            icon: BadgeTypes.CHARGE,
            text: ChargeTypeNames.CHARGE
          },
          right: {
            type: item.copnDtlClNm.substring(0, subIdx),
            amount: item.copnDtlClNm.substring(subIdx),
            color: 'blue'
          }
        });

        return nData;
      }, {});
    });
  }

  private getRefillGifts = (): Observable<IChargeData | null> => {
    return this.apiService.request(API_CMD.BFF_06_0003, { type: 0 }).map((resp: { code: string; result: any }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return null;
      }

      return resp.result.reduce((nData: IChargeData, item) => {
        const key = item.copnOpDt;

        if (!nData[key]) {
          nData[key] = [];
        }

        nData[key].push({
          type: RechargeTypes.REFILL_GIFT,
          typeName: TypeNames.REFILL_GIFT,
          date: DateHelper.getShortDateNoYear(key),
          badge: {
            icon: BadgeTypes.GIFT,
            text: ChargeTypeNames.GIFT
          },
          bottom: [item.svcNum]
        });

        return nData;
      }, {});
    });
  }

  private mergeCharges = (histories: Array<IChargeData | null>): { data: IChargeData; count: number } => {
    return histories.reduce(
      (nData, item) => {
        if (item) {
          for (const key of Object.keys(item)) {
            if (!nData.data[key]) {
              nData.data[key] = [];
            }

            nData.data[key] = nData.data[key].concat(item[key]);
            nData.count += item[key].length;
          }
        }

        return nData;
      },
      { data: {}, count: 0 }
    );
  }
}
