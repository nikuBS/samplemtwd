/**
 * @description 충전 선물 내역
 * @file myt-data.datainfo.controller.ts
 * @author Jiyoung Jo
 * @since 2018.09.20
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

  /**
   * @description 화면 랜더
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_06_0077, { fromDt: this.fromDt, toDt: this.toDt }).subscribe(resp => {  // 오늘 부터 1년치 데이터 가져 옴
      // BFF 성능 개선 사항으로, 6개 항목에 대한 데이터 갯수 조회 후 갯수가 1이상인 케이스만 호출해야 함
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          ...resp,
          pageInfo,
          svcInfo
        });
      }

      const historyCounts = resp.result || {};

      Observable.combineLatest(
        this.getDataGifts(Number(historyCounts.tdataSndCnt || 0) + Number(historyCounts.tdataRcvCnt || 0)), // 데이터 선물 보냄, 받음 횟수 
        this.getLimitCharges(Number(historyCounts.lmtChrgCnt || 0)),  // 데이터 한도 충전 횟수
        this.getTingCharges(Number(historyCounts.tingIneeCnt || 0)),  // 팅 충전 횟수
        this.getTingGifts(Number(historyCounts.tingGiftRcvCnt || 0) + Number(historyCounts.tingGiftSndCnt || 0)), // 팅 선물하기 횟수
        this.getRefillUsages(Number(historyCounts.rifilUseCnt || 0)), // 리필쿠폰 사용 횟수
        this.getRefillGifts(Number(historyCounts.rifilSndCnt || 0) + Number(historyCounts.rifilRcvCnt || 0))  // 리필 쿠폰 선물 횟수
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
          all: this.mergeCharges(histories) // BFF에서 충전/선물 내역 소팅이 불가하여 전체 리스트 머지 후, 최신 날짜부터 정렬 함
        };

        let filterIdx = -1;

        switch (req.query.filter) { // 충전 선물 페이지 진입 시 특정 유형만 표시되어야 하는 경우
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
  /** 
   * @description 데이터 선물 보냄, 받음 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 데이터 선물 보냄, 받음 횟수
   */
  private getDataGifts = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
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

  /**
   * @description 데이터 한도 충전 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 데이터 한도 충전 횟수
   */
  private getLimitCharges = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
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

        /**
         * BFF 요청사항
         * opTypCd 1: 당월 충전, 2: 당월 충전 취소, 3: 자동 충전, 4: 자동 충전 취소
         * 충전이고, 당일 일 때 취소 가능로직
         */
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

  /**
   * @description 팅/쿠키즈 충전 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 팅/쿠키즈 충전 횟수
   */
  private getTingCharges = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
      return of([]);
    }

    return this.apiService.request(API_CMD.BFF_06_0032, { fromDt: this.fromDt, toDt: this.toDt }).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      /**
       * BFF 요청사항
       * opTypCd 1: 일반 충전, 2: 일반 충전 취소, 3: 자동 충전, 4: 자동 충전 취소
       * 충전이고, 당일 일 때 취소 가능로직
       */
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

  /**
   * @description 팅/쿠키즈 선물 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 팅/쿠키즈 선물 보냄, 받음 횟수
   */
  private getTingGifts = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
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


  /**
   * @description 리필 쿠폰 사용 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 리필 쿠폰 사용 횟수
   */
  private getRefillUsages = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
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

  /**
   * @description 리필 쿠폰 선물 내역 api 호출(유형마다 노출 property가 달라 별도 처리함)
   * @param  {number} count 리필 쿠폰 선물 횟수
   */
  private getRefillGifts = (count: number) => {
    if (count <= 0) { // 횟수가 0이하인 경우 빈 Array 리턴
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

  /**
    @description 충전/선물 내역 전체 리스트 날짜 별로 소팅(BFF 요청 사항)
    @param {Array} histories 충전 선물 전체 내역
  */
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
