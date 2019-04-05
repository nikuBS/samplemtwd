/**
 * @file test.myt-data.datainfo.controller.ts
 * @author Jiyoung Jo
 * @since 2018.11.23
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {
  MYT_DATA_CHARGE_TYPE_NAMES as TypeNames,
  UNIT,
  MYT_DATA_CHARGE_TYPES as ChargeTypeNames,
  DATA_UNIT,
  CURRENCY_UNIT
} from '../../../types/string.type';

import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import { DATA_GIFTS, LIMIT_CHARGES, TING_CHARGES, REFILL_USAGES, TING_GIFTS, REFILL_GIFTS } from '../../../mock/server/myt-data.datainfo.mock';
import { API_CODE } from '../../../types/api-command.type';

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
  data: { [key: string]: ICharge[] };
  count: number;
  typeName: TypeNames;
}

enum BadgeTypes {
  GIFT = 'gift',
  CHARGE = 'refill'
}

export default class TestMyTDataInfo extends TwViewController {
  private fromDt: string = DateHelper.getPastYearShortDate();
  private toDt: string = DateHelper.getShortDate(new Date());

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const chargeData: { all: IChargeData; display?: IChargeData; filterIdx?: number } = {
      all: this.mergeCharges([
        this.getDataGifts(),
        this.getLimitCharges(),
        this.getTingCharges(),
        this.getTingGifts(),
        this.getRefillUsages(),
        this.getRefillGifts()
      ])
    };
    let filterIdx = -1;

    switch (req.query.filter) {
      case 'data-gifts':
        filterIdx = 0;
        break;
      case 'limit-charges':
        filterIdx = 1;
        break;
      case 'ting-charges':
        filterIdx = 2;
        break;
      case 'ting-gifts':
        filterIdx = 3;
        break;
      case 'refill-usages':
        filterIdx = 4;
        break;
      case 'refill-gifts':
        filterIdx = 5;
        break;
    }

    if (filterIdx >= 0) {
      const display = chargeData.all[filterIdx];
      if (display) {
        chargeData.display = display;
      }
      chargeData.filterIdx = filterIdx + 1;
    }

    res.render('test.myt-data.datainfo.html', { svcInfo, chargeData, pageInfo });
  }

  private getDataGifts = () => {
    const resp = DATA_GIFTS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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
              unit: DATA_UNIT.GB,
              color: item.type === '1' ? 'red' : 'blue'
            }
            : {
              amount: amount,
              unit: DATA_UNIT.MB,
              color: item.type === '1' ? 'red' : 'blue'
            },
        bottom: item.giftType === 'GC' ? [item.svcNum, ChargeTypeNames.FIXED] : [item.svcNum]
      });

      return nData;
    }, {});

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.DATA_GIFT
    };
  };

  private getLimitCharges = () => {
    const resp = LIMIT_CHARGES;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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
          unit: CURRENCY_UNIT.WON,
          color: 'blue'
        },
        bottom: [item.opTypNm]
      });

      return nData;
    }, {});

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.LIMIT_CHARGE
    };
  };

  private getTingCharges = () => {
    const resp = TING_CHARGES;
    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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
          unit: CURRENCY_UNIT.WON,
          color: item.opTypCd === '2' || item.opTypCd === '4' ? 'gray' : 'blue'
        },
        badge: {
          icon: BadgeTypes.CHARGE,
          text: ChargeTypeNames.CHARGE
        },
        refundable: item.refundableYn === 'Y',
        bottom: item.opTypCd === '2' || item.opTypCd === '4' ? [item.opTypNm, ChargeTypeNames.CANCEL] : [item.opTypNm]
      });

      return nData;
    }, {});

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.TING_CHARGE
    };
  };

  private getTingGifts = () => {
    const resp = TING_GIFTS;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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
          unit: CURRENCY_UNIT.WON,
          color: item.opTypCd === '1' ? 'red' : 'blue'
        },
        badge: {
          icon: BadgeTypes.GIFT,
          text: ChargeTypeNames.GIFT
        },
        bottom: item.opTypCd === '2' || item.opTypCd === '4' ? [item.opTypNm, ChargeTypeNames.CANCEL] : [item.opTypNm]
      });

      return nData;
    }, {});

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.TING_GIFT
    };
  };

  private getRefillUsages = () => {
    const resp = REFILL_USAGES;

    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.REFILL_USAGE
    };
  };

  private getRefillGifts = () => {
    const resp = REFILL_GIFTS;
    if (resp.code !== API_CODE.CODE_00) {
      return null;
    }

    const data = resp.result.reduce((nData, item) => {
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

    return {
      data,
      count: resp.result.length,
      typeName: TypeNames.REFILL_GIFT
    };
  };

  private mergeCharges = (histories: Array<IChargeData | null>): IChargeData => {
    return histories.reduce(
      (nData: IChargeData, item) => {
        if (item) {
          for (const key of Object.keys(item.data)) {
            if (!nData.data[key]) {
              nData.data[key] = [];
            }

            nData.data[key] = nData.data[key].concat(item.data[key]);
            nData.count += item.data[key].length;
          }
        }

        return nData;
      },
      { data: {}, count: 0, typeName: TypeNames.ALL }
    );
  }
}
