/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.14
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, API_T_FAMILY_ERROR } from '../../types/api-command.type';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import { CURRENCY_UNIT, DATA_UNIT, MYT_T_DATA_GIFT_TYPE } from '../../types/string.type';
import { MYT_DATA_SUBMAIN_TITLE } from '../../types/title.type';
import BrowserHelper from '../../utils/browser.helper';
import { UNIT, UNIT_E } from '../../types/bff.type';
import { BANNER_MOCK } from '../../mock/server/radis.banner.mock';
import { REDIS_BANNER_ADMIN } from '../../types/redis.type';

const skipIdList: any = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];

class MytDataSubmainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isBenefit: false,
      immCharge: true,
      present: false,
      isPrepayment: false,
      isDataInfo: false,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc),
      isApp: BrowserHelper.isApp(req)
    };
    Observable.combineLatest(
      this._getFamilyMoaData(),
      this._getRemnantData(),
      this._getDataPresent(),
      this._getRefillCoupon(),
      // this._getPrepayCoupon(),
      this._getDataChargeBreakdown(),
      this._getDataPresentBreakdown(),
      this._getTingPresentBreakdown(),
      this._getEtcChargeBreakdown(),
      this._getRefillPresentBreakdown(),
      this._getRefillUsedBreakdown(),
      this._getUsagePatternSevice(),
      this.redisService.getData(REDIS_BANNER_ADMIN + pageInfo.menuId),
    ).subscribe(([family, remnant, present, refill, dcBkd, dpBkd, tpBkd, etcBkd, refpBkd, refuBkd, pattern, banner]) => {
      if ( !svcInfo.svcMgmtNum || remnant.info ) {
        // 비정상 진입 또는 API 호출 오류
        this.error.render(res, {
          title: MYT_DATA_SUBMAIN_TITLE.MAIN,
          code: remnant.info.code,
          msg: remnant.info.msg,
          svcInfo: svcInfo
        });
        return false;
      }
      // TODO: 실시간 잔여량 합산 API 정상 동작 후 재확인 필요
      if ( remnant ) {
        data.remnantData = this.parseRemnantData(remnant);
        if ( data.remnantData.gdata ) {
          data.isDataInfo = true;
        }
      }

      if ( child && child.length > 0 ) {
        data.otherLines = Object.assign(this.convertChildLines(child), data.otherLines);
      }
      // 9차: PPS, T-Login, T-PocketFi 인 경우 다른회선 잔여량이 노출되지 않도록 변경
      if ( svcInfo.svcAttrCd === 'M2' || svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4' ) {
        data.otherLines = [];
      }
      // SP9 즉시충전버튼 무조건 노출로 변경
      /*if ( svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4' /!* 기본 DATA 제공량이 없는 경우*!/ ) {
        // 비노출 조건 T-pocketFi or T-Login 인 경우와 기본제공량이 없는경우
        // 즉시충전버튼 영역
        data.immCharge = false;
      }*/
      if ( svcInfo.svcAttrCd === 'M1'/* || svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4'*/ ) {
        // 데이터혜택/활용하기 영역
        // 휴대폰, T-pocketFi, T-Login  경우 노출 - 9차에서 휴대폰인 경우에만 노출
        data.isBenefit = true;
        // 선불쿠폰영역 휴대폰 인 경우에만 노출 (9차)
        data.isPrepayment = true;
      }

      if ( present /*&& (present.familyMemberYn === 'Y' || present.goodFamilyMemberYn === 'Y')*/ ) {
        // T끼리 데이터선물버튼 영역
        data.present = true;
      }
      if ( refill && refill.length > 0 ) {
        // 리필쿠폰
        data.refill = refill;
      }

      // T가족모아 데이터
      if ( family && Object.keys(family).length > 0 ) {
        if ( family.impossible ) {
          // T가족모아 미가입인 경우
          data.family = family;
        } else {
          data.family = this.convertFamilyData(family, svcInfo);
          const remained = parseInt(data.family.shared, 10) - parseInt(data.family.used, 10);
          data.family.remained = FormatHelper.convDataFormat(remained, DATA_UNIT.GB).data;
          data.family.limitation = parseInt(data.family.limitation, 10);
          // T가족모아 서비스는 가입되어있지만 공유 불가능하거나 미성년인 경우
          if ( data.family.shrblYn === 'N' || data.family.adultYn === 'N' ) {
            data.family.noshare = true;
          }
        }
      }

      // 최근 충전 및 선물 내역
      const breakdownList: any = [];
      if ( dcBkd && dcBkd.length > 0 ) {
        // 데이터한도요금제 충전내역
        dcBkd.map((item) => {
          item['class'] = (item.opTypCd === '2' || item.opTypCd === '4') ? 'send' : 'recharge';
          item['u_title'] = item.opTypNm;
          item['u_sub'] = item.opOrgNm;
          item['d_title'] = item.amt;
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = CURRENCY_UNIT.WON;
        });
        breakdownList.push(FormatHelper.groupByArray(dcBkd, 'opDt'));
      }
      if ( dpBkd && dpBkd.length > 0 ) {
        // T끼리 선물하기 내역
        // type: 1 send, 2 recharge
        dpBkd.map((item) => {
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = item.custNm;
          item['u_sub'] = MYT_T_DATA_GIFT_TYPE[item.giftType] + ' | ' + item.svcNum;
          item['d_title'] = item.dataQty;
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = DATA_UNIT.MB;
        });
        breakdownList.push(FormatHelper.groupByArray(dpBkd, 'opDt'));
      }
      if ( tpBkd && tpBkd.length > 0 ) {
        // 팅요금 선물하기 내역
        // opTypCd: 1 send, 2 recharge
        tpBkd.map((item) => {
          item['class'] = (item.opTypCd === '1' ? 'send' : 'recharge');
          item['u_title'] = item.opTypNm;
          item['u_sub'] = item.custNm + ' | ' + item.svcNum;
          item['d_title'] = item.amt;
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = CURRENCY_UNIT.WON;
        });
        breakdownList.push(FormatHelper.groupByArray(tpBkd, 'opDt'));
      }
      if ( etcBkd && etcBkd.length > 0 ) {
        // 팅/쿠키즈/안심요금 충전 내역
        etcBkd.map((item) => {
          item['class'] = (item.opTypCd === '2' || item.opTypCd === '4') ? 'send' : 'recharge';
          item['u_title'] = item.opTypNm;
          item['u_sub'] = '';
          item['d_title'] = item.amt;
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = CURRENCY_UNIT.WON;
        });
        breakdownList.push(FormatHelper.groupByArray(etcBkd, 'opDt'));
      }
      if ( refpBkd && refpBkd.length > 0 ) {
        // 리필쿠폰 선물 내역
        refpBkd.map((item) => {
          item['opDt'] = item.copnOpDt;
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = item.opTypNm;
          item['u_sub'] = item.copnNm + ' | ' + item.svcNum;
          item['d_title'] = ''; // API response 값에 정의되어있지 않음
          item['d_sub'] = DateHelper.getShortDate(item.copnOpDt);
          item['unit'] = '';
        });
        breakdownList.push(FormatHelper.groupByArray(refpBkd, 'opDt'));
      }
      if ( refuBkd && refuBkd.length > 0 ) {
        // 리필쿠폰 사용이력조회
        refuBkd.map((item) => {
          item['opDt'] = item.copnUseDt;
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = item.copnNm;
          item['u_sub'] = '';
          item['d_title'] = item.copnDtlClNm; // API response 값에 정의되어있지 않음
          item['d_sub'] = DateHelper.getShortDate(item.copnUseDt);
          item['unit'] = '';
        });
        breakdownList.push(FormatHelper.groupByArray(refuBkd, 'opDt'));
      }
      if ( breakdownList.length > 0 ) {
        data.breakdownList = this.sortBreakdownItems(breakdownList);
      }
      // 최근 데이터/음성/문자 사용량
      if ( pattern ) {
        data.pattern = pattern;
      }
      // 배너 정보
      if ( banner.code === API_CODE.REDIS_SUCCESS ) {
        if ( !FormatHelper.isEmpty(banner.result) ) {
          data.banner = this.parseBanner(banner.result);
        }
      }

      res.render('myt-data.submain.html', { data });
    });
  }

  parseBanner(data: any) {
    const banners = data.banners;
    const sort = {};
    const result: any = [];
    banners.forEach((item) => {
      // 배너노출순번의 정보가 있는 경우
      if ( item.bnnrExpsSeq ) {
        sort[item.bnnrExpsSeq] = item;
      } else {
        sort[item.bnnrSeq] = item;
      }
    });
    const keys = Object.keys(sort).sort();
    keys.forEach((key) => {
      result.push(sort[key]);
    });

    return result;
  }

  convShowData(data: any) {
    data.isUnlimit = !isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = Math.round(data.remained / data.total * 100);
    }
  }

  calculationData(tmoaremained: number, tmoatotal: number, etcremained: number, etctotal: number): any {
    const result: any = {};
    const total = tmoatotal + etctotal;
    const totalRemained = tmoaremained + etcremained;
    result.showTotal = this.convFormat(total.toString(), UNIT_E.DATA);
    result.showRemained = this.convFormat(totalRemained.toString(), UNIT_E.DATA);
    result.showTmoaRemained = this.convFormat(tmoaremained.toString(), UNIT_E.DATA);
    result.showEtcmoaRemained = this.convFormat(etcremained.toString(), UNIT_E.DATA);
    result.tmoaRemainedRatio = Math.round(tmoaremained / total * 100);
    result.etcRemainedRatio = Math.round(etcremained / total * 100);
    result.totalRemainedRatio = Math.round(totalRemained / total * 100);
    return result;
  }

  convFormat(data: string, unit: string): string {
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

  parseRemnantData(remnant: any): any {
    const GDATA = remnant['gnrlData'] || [];
    const SDATA = remnant['spclData'] || [];
    const VOICE = remnant['voice'] || [];
    const SMS = remnant['sms'] || [];
    let tmoaRemained = 0;
    let tmoaTotal = 0;
    let etcRemained = 0;
    let etcTotal = 0;
    const result: any = {
      gdata: [],
      sdata: [],
      voice: [],
      sms: [],
      tmoa: [],
      totalLimit: false,
      total: null
    };
    if ( GDATA.length > 0 ) {
      GDATA.filter((item) => {
        if ( item.unlimit === '1' || item.unlimit === 'B' || item.unlimit === 'M' ) {
          result.totalLimit = true;
        }
        this.convShowData(item);
        // POT10, POT20
        if ( item.skipId === skipIdList[0] || item.skipId === skipIdList[1] ) {
          result['tmoa'].push(item);
          tmoaRemained += parseInt(item.remained, 10);
          tmoaTotal += parseInt(item.total, 10);
        } else {
          result['gdata'].push(item);
          etcRemained += result.totalLimit ? 100 : parseInt(item.remained, 10);
          etcTotal += result.totalLimit ? 100 : parseInt(item.total, 10);
        }
      });
      if ( !result.totalLimit ) {
        result.total = this.calculationData(tmoaRemained, tmoaTotal, etcRemained, etcTotal);
      } else {
        result.total = {
          etcRemainedRatio: 100,
          totalRemainedRatio: 0
        };
      }
    }
    if ( SDATA.length > 0 ) {
      SDATA.filter((item) => {
        this.convShowData(item);
        // if ( skipIdList.indexOf(item.skipId) === -1 ) {
        result['sdata'].push(item);
        // }
      });
    }
    if ( VOICE.length > 0 ) {
      VOICE.filter((item) => {
        this.convShowData(item);
        result['voice'].push(item);
      });
    }
    if ( SMS.length > 0 ) {
      SMS.filter((item) => {
        this.convShowData(item);
        result['sms'].push(item);
      });
    }
    return result;
  }

  convertChildLines(items): any {
    const list: any = [];
    items.filter((item) => {
      list.push({
        child: true,
        nickNm: item.childEqpMdNm, // item.mdlName 서버데이터 확인후 변경
        svcNum: item.svcNum,
        svcMgmtNum: item.svcMgmtNum,
        data: '', // TODO: 개발이 되지 않은 항목 추후 작업 필요
        unit: '' // TODO: 개발이 되지 않은 항목 추후 작업 필요
      });
    });
    return list;
  }

  convertOtherLines(target, items): any {
    // 다른 회선은 휴대폰만 해당;
    const MOBILE = (items && items['M']) || [];
    const list: any = [];
    if ( MOBILE.length > 0 ) {
      const nOthers: any = Object.assign([], MOBILE);
      nOthers.filter((item) => {
        if ( target.svcMgmtNum !== item.svcMgmtNum ) {
          item.nickNm = item.eqpMdlNm || item.nickNm;
          list.push(item);
        }
      });
    }
    return list;
  }

  convertFamilyData(items, svcInfo): any {
    let info: any = {
      'total': items.total,
      'adultYn': items.adultYn,
    };
    const list = items.mbrList;
    if ( list ) {
      list.filter((item) => {
        if ( item.svcMgmtNum === svcInfo.svcMgmtNum ) {
          info = Object.assign(info, item);
        }
      });
    }
    return info;
  }

  sortBreakdownItems(items): any {
    const returnVal: any = [];
    let group: any = [];
    items.forEach((val) => {
      group = Object.assign(group, Object.keys(val));
    });
    group.reverse(); // 최근으로 정렬하기 위함
    group = group.slice(0, 3); // 최근 기준 3개
    items.filter((item) => {
      const keys = Object.keys(item);
      for ( const key of keys ) {
        group.map((gp) => {
          if ( gp === key ) {
            returnVal.push(item[key]);
          }
        });
      }
    });
    return returnVal.reverse();
  }

  // T가족모아데이터 정보
  _getFamilyMoaData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0044, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else if ( resp.code === API_T_FAMILY_ERROR.BLN0010 ) {
        // T가족모아 가입 가능한 요금제이나 미가입으로 가입유도 화면 노출
        return {
          impossible: true
        };
      } else {
        // error
        return null;
      }
    });
  }

  _getRemnantData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return {
          info: resp
        };
      }
    });
  }

  // 나의 리필 쿠폰
  _getRefillCoupon(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  /**
   * 선불형 쿠폰 TBD 항목
   _getPrepayCoupon():  Observable<any> {

  }*/
  // T끼리 데이터 선물 버튼
  _getDataPresent() {
    return this.apiService.request(API_CMD.BFF_06_0015, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return {
          info: resp
        };
      }
    });
  }

  // T 끼리 선물하기 선물내역 (1년기준)
  _getDataPresentBreakdown() {
    const curDate = new Date();
    const beforeDate = new Date();
    beforeDate.setTime(curDate.getTime() - (365 * 24 * 60 * 60 * 1000));
    return this.apiService.request(API_CMD.BFF_06_0018, {
      fromDt: DateHelper.getCurrentShortDate(curDate),
      toDt: DateHelper.getCurrentShortDate(beforeDate),
      type: '0' // 0: all, 1: send, 2: recharge
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 팅요금 선물내역
  _getTingPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0026, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 데이터한도요금제 충전내역
  _getDataChargeBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0042, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 팅/쿠키즈/안심음성 충전내역
  _getEtcChargeBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0032, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 리필쿠폰 사용이력조회
  _getRefillUsedBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0002, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 리필쿠폰 선물내역
  _getRefillPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0003, {
      type: '0' // 받은내역, 보낸내역 동시 조회
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // 최근 사용패턴 사용량
  _getUsagePatternSevice() {
    const curDate = new Date().getDate();
    return this.apiService.request(API_CMD.BFF_05_0091, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        // 1 ~ 4 일 (집계중으로표시하지 않음)
        if ( curDate < 5 ) {
          return null;
        } else {
          return resp.result;
        }
      } else {
        // error
        return null;
      }
    });
  }

  _getBannerMock(): Observable<any> {
    return Observable.create((obs) => {
      obs.next(BANNER_MOCK);
      obs.complete();
    });
  }
}

export default MytDataSubmainController;

