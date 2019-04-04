/**
 * FileName: myt-data.datainfo.controller.ts
 * @author Jiyoung Jo
 * Date: 2018.09.20
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Rx';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {
  MYT_DATA_CHARGE_TYPE_NAMES as TypeNames,
  MYT_DATA_CHARGE_TYPES as ChargeTypeNames,
  ETC_CENTER,
  MYT_DATA_REFILL_TYPES,
  CURRENCY_UNIT,
  MYT_DATA_CHARGE_TYPES,
  MYT_DATA_HISTORY_BADGE_NAMES
} from '../../../../types/string.type';

import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { REFILL_USAGE_DATA_CODES } from '../../../../types/bff.type';
import { of } from 'rxjs/observable/of';

enum RechargeTypes {
  DATA_GIFT,
  LIMIT_CHARGE,
  TING_CHARGE,
  TING_GIFT,
  REFILL,
  ALL
}

export default class MyTDataHistory extends TwViewController {
  private fromDt: string = DateHelper.getPastYearShortDate();
  private toDt: string = DateHelper.getCurrentShortDate();

  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_06_0077, { fromDt: this.fromDt, toDt: this.toDt }).subscribe(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          ...resp,
          pageInfo,
          svcInfo
        });
      }

      const historyCounts = resp.result || {};

      Observable.combineLatest(
        this.getDataGifts(Number(historyCounts.tdataSndCnt || 0) + Number(historyCounts.tdataRcvCnt || 0)),
        this.getLimitCharges(Number(historyCounts.lmtChrgCnt || 0)),
        this.getTingCharges(Number(historyCounts.tingIneeCnt || 0)),
        this.getTingGifts(Number(historyCounts.tingGiftRcvCnt || 0) + Number(historyCounts.tingGiftSndCnt || 0)),
        this.getRefillUsages(Number(historyCounts.rifilUseCnt || 0)),
        this.getRefillGifts(Number(historyCounts.rifilSndCnt || 0) + Number(historyCounts.rifilRcvCnt || 0))
      ).subscribe(histories => {
        const errorIdx = histories.findIndex(history => {
          return history && history.code;
        });

        if (errorIdx >= 0) {
          const error: { code: string; msg: string } = histories[errorIdx];
          return this.error.render(res, {
            ...error,
            pageInfo,
            svcInfo
          });
        }

        const chargeData: { all: any[]; display?: any[] } = {
          all: this.mergeCharges(histories)
        };

        let filterIdx = -1;

        switch (req.query.filter) {
          case 'data-gifts':
            filterIdx = RechargeTypes.DATA_GIFT;
            break;
          case 'limit-charges':
            filterIdx = RechargeTypes.LIMIT_CHARGE;
            break;
          case 'ting-charges':
            filterIdx = RechargeTypes.TING_CHARGE;
            break;
          case 'ting-gifts':
            filterIdx = RechargeTypes.TING_GIFT;
            break;
          case 'refill':
            filterIdx = RechargeTypes.REFILL;
            break;
          default:
            filterIdx = RechargeTypes.ALL;
            break;
        }

        if (filterIdx < 4) {
          chargeData.display = histories[filterIdx];
        } else if (filterIdx === 4) {
          chargeData.display = histories[filterIdx].concat(histories[filterIdx + 1]);
        }

        res.render('history/myt-data.history.html', { svcInfo, pageInfo, filterIdx, chargeData });
      });
    });
  }

  private getDataGifts = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0018, { fromDt: this.fromDt, toDt: this.toDt }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result.map(item => {
        const key = item.opDtm || item.opDt,
          amount = FormatHelper.convDataFormat(item.dataQty, 'MB');

        return {
          key,
          type: RechargeTypes.DATA_GIFT,
          typeName: TypeNames.DATA_GIFT,
          date: DateHelper.getShortDate(key.substring(0, 8)),
          badge: item.type === '1' ? 'send' : 'recieve',
          badgeName: item.type === '1' ? MYT_DATA_HISTORY_BADGE_NAMES.SEND : MYT_DATA_HISTORY_BADGE_NAMES.RECEIVE,
          right: amount.data + amount.unit,
          bottom:
            item.giftType === 'GC' ?
              [ChargeTypeNames.FIXED, FormatHelper.conTelFormatWithDash(item.svcNum)] :
              [FormatHelper.conTelFormatWithDash(item.svcNum)]
        };
      });
    });
  }

  private getLimitCharges = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0042, { fromDt: this.fromDt, toDt: this.toDt, type: 1 }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result.filter(item => {
        return Number(item.opTypCd) !== 4;
      }).map(item => {
        const key = item.opDtm || item.opDt,
          rechargeDate = DateHelper.getShortDate(key),
          bottom = item.opTypCd === '3' ? [MYT_DATA_CHARGE_TYPES.FIXED] : [];
        bottom.push(item.opOrgNm || ETC_CENTER);

        return {
          key,
          type: RechargeTypes.LIMIT_CHARGE,
          typeName: TypeNames.LIMIT_CHARGE,
          date: DateHelper.getShortDate(key.substring(0, 8)),
          badge: 'recharge',
          badgeName: MYT_DATA_HISTORY_BADGE_NAMES.CHARGE,
          refundable: (item.opTypCd === '1' || item.opTypCd === '3') && DateHelper.getDiffByUnit(this.toDt, rechargeDate, 'days') === 0,
          right: FormatHelper.addComma(item.amt) + CURRENCY_UNIT.WON,
          bottom
        };
      });
    });
  }

  private getTingCharges = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0032, { fromDt: this.fromDt, toDt: this.toDt }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result
        .filter(item => {
          return Number(item.opTypCd) !== 4;
        })
        .map(item => {
          const key = item.opDtm || item.opDt,
            rechargeDate = DateHelper.getShortDate(key),
            bottom: string[] = [];

          if (item.opTypCd === '2' || item.opTypCd === '4') {
            bottom.push(ChargeTypeNames.CANCEL);
          } else if (item.opTypCd === '3') {
            bottom.push(ChargeTypeNames.FIXED);
          }
          bottom.push(item.opOrgNm || ETC_CENTER);

          return {
            key,
            type: RechargeTypes.TING_CHARGE,
            typeName: TypeNames.TING_CHARGE,
            date: DateHelper.getShortDate(key.substring(0.8)),
            badge: 'recharge',
            badgeName: MYT_DATA_HISTORY_BADGE_NAMES.CHARGE,
            refundable: (item.opTypCd === '1' || item.opTypCd === '3') && DateHelper.getDiffByUnit(this.toDt, rechargeDate, 'days') === 0,
            right: FormatHelper.addComma(item.amt) + CURRENCY_UNIT.WON,
            bottom
          };
        });
    });
  }

  private getTingGifts = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0026, { fromDt: this.fromDt, toDt: this.toDt }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result.map(item => {
        const key = item.opDtm || item.opDt;
        return {
          key,
          type: RechargeTypes.TING_GIFT,
          typeName: TypeNames.TING_GIFT,
          date: DateHelper.getShortDate(key.substring(0, 8)),
          badge: item.opTypCd === '1' ? 'send' : 'recieve',
          badgeName: item.opTypCd === '1' ? MYT_DATA_HISTORY_BADGE_NAMES.SEND : MYT_DATA_HISTORY_BADGE_NAMES.RECEIVE,
          right: FormatHelper.addComma(item.amt) + CURRENCY_UNIT.WON,
          bottom: [FormatHelper.conTelFormatWithDash(item.svcNum)]
        };
      });
    });
  }

  private getRefillUsages = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0002, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result
        .filter(item => {
          return DateHelper.getDifference((item.copnUseDtm || item.copnUseDt).substring(0, 8), this.fromDt) >= 0;
        })
        .map(item => {
          const key = item.copnUseDtm || item.copnUseDt;
          return {
            key,
            type: RechargeTypes.REFILL,
            typeName: TypeNames.REFILL_USAGE,
            date: DateHelper.getShortDate(key.substring(0, 8)),
            badge: 'recharge',
            badgeName: MYT_DATA_HISTORY_BADGE_NAMES.CHARGE,
            right: REFILL_USAGE_DATA_CODES.indexOf(item.copnDtlClCd) >= 0 ? MYT_DATA_REFILL_TYPES.DATA : MYT_DATA_REFILL_TYPES.VOICE,
            bottom: [item.opOrgNm || ETC_CENTER]
          };
        });
    });
  }

  private getRefillGifts = (count: number) => {
    if (count <= 0) {
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0003, { type: 0 }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result
        .filter(item => {
          return DateHelper.getDifference((item.copnOpDtm || item.copnOpDt).substring(0, 8), this.fromDt) >= 0;
        })
        .map(item => {
          const key = item.copnOpDtm || item.copnOpDt;
          return {
            key,
            type: RechargeTypes.REFILL,
            typeName: TypeNames.REFILL_GIFT,
            date: DateHelper.getShortDate(key.substring(0, 8)),
            badge: item.type === '1' ? 'send' : 'recieve',
            badgeName: item.type === '1' ? MYT_DATA_HISTORY_BADGE_NAMES.SEND : MYT_DATA_HISTORY_BADGE_NAMES.RECEIVE,
            bottom: [FormatHelper.conTelFormatWithDash(item.svcNum)]
          };
        });
    });
  }

  private mergeCharges = histories => {
    return Array.prototype.concat.apply([], histories).sort((a, b) => {
      if (a.key > b.key) {
        return -1;
      } else if (a.key < b.key) {
        return 1;
      }
      return 0;
    });
  }
}
