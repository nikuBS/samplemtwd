/*
 * @file
 * @author Kim InHwan (skt.P132150@partner.sk.com)
 * @since 2018.09.14
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, SESSION_CMD } from '../../types/api-command.type';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import {
  CURRENCY_UNIT,
  ETC_CENTER,
  MYT_DATA_CHARGE_TYPE_NAMES,
  MYT_DATA_CHARGE_TYPES,
  MYT_DATA_HISTORY,
  MYT_DATA_REFILL_TYPES
} from '../../types/string.type';
import BrowserHelper from '../../utils/browser.helper';
import {
  LOGIN_TYPE,
  PREPAID_PAYMENT_PAY_CD,
  PREPAID_PAYMENT_TYPE,
  REFILL_USAGE_DATA_CODES,
  SVC_ATTR_NAME,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE,
  TPLAN_SHARE_ID, //  T가족모아 공유 가능 요금제
  TPLAN_PROD_ID, S_FLAT_RATE_PROD_ID, SVC_CDGROUP, SVC_ATTR_E, //  T가족모아 가입 가능 요금제
  _5GX_PROD_ID, // 5GX 데이터 시간권/장소권
  _5GXTICKET_PROD_ID, _5GXTICKET_TIME_SET_SKIP_ID // 5GX 데이터 시간권/장소권
} from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';

// 실시간잔여량 공제항목
const skipIdList: Array<string> = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];

// TODO: 단위 변환등은 모두 취합하여 한 함수로 이동 static으로구현 해보자!
const parceTimesString = (times: any) => {
  // 시간과 분이 서로 의무적으로 존재해야 하는 것은 아니므로, 각각의 조건문으로 분리하여 처리한다.
  if (times.hours) {
    times.string = `${times.hours}시`;
  } else {
    times.string = '';
  }
  if (times.min) {
    times.string = `${times.string} ${times.min}분`;
  }
  return times;
};

class MytDataSubmainController extends TwViewController {
  constructor() {
    super();
  }

  private fromDt = DateHelper.getPastYearShortDate();
  private toDt = DateHelper.getCurrentShortDate();
  private isPPS = false;

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: Object.assign({}, svcInfo),
      pageInfo: pageInfo,
      isBenefit: false,
      immCharge: true,
      present: false,
      isPrepayment: false,
      isDataInfo: false,
      ppsAlarm: false,
      ppsInfo: false,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(Object.assign({}, svcInfo), Object.assign({}, allSvc)),
      isApp: BrowserHelper.isApp(req),
      bpcpServiceId: req.query.bpcpServiceId || '',
      eParam: req.query.eParam || '',
    };

    this.isPPS = data.svcInfo.svcAttrCd === 'M2';
    Observable.combineLatest(
      this._getRemnantData(data.svcInfo),
      this._getDataPresent(),
      this._getRefillCoupon(),
      this._reqRefillGiftHistory(),
      // this._getPrepayCoupon(),
      /*this._getDataChargeBreakdown(),
      this._getDataPresentBreakdown(),
      this._getTingPresentBreakdown(),
      this._getEtcChargeBreakdown(),
      this._getRefillPresentBreakdown(),
      this._getRefillUsedBreakdown()*/
      // this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId),
    ).subscribe(([remnant, present, refill, refillGiftHistory /*dcBkd, dpBkd, tpBkd, etcBkd, refpBkd, refuBkd*/ /*,banner*/]) => {
      if ( remnant.info ) {
        data.remnant = remnant;
      } else {
        data.remnantData = this.parseRemnantData(remnant, data);
        if ( data.remnantData.gdata && data.remnantData.gdata.length > 0 ) {
          data.isDataShow = true;
        }
        if ( data.remnantData.sdata && data.remnantData.sdata.length > 0 ) {
          data.isSpDataShow = true;
        }
        if ( data.remnantData.voice && data.remnantData.voice.length > 0 ) {
          data.isVoiceShow = true;
          data.voiceItemToShow = data.remnantData.voice[0];
          // 음성 잔여량 공제항목이 여러개인 경우 잔여량이 0인 항목은 후순위 노출
          if (data.remnantData.voice.length > 1) {
            data.voiceItemToShow = data.remnantData.voice.find((_data) => {
              return parseInt(_data.remained, 10) > 0 || (UNLIMIT_CODE.indexOf(_data.unlimit) !== -1);
            });
            if (!data.voiceItemToShow) {
              data.voiceItemToShow = data.remnantData.voice[0];
            }
          }
        }
        if ( data.remnantData.sms && data.remnantData.sms.length > 0 ) {
          data.isSmsShow = true;
        }
        if ( data.remnantData.gdata.length === 0 && data.remnantData.sdata.length === 0 &&
          data.remnantData.voice.length === 0 && data.remnantData.sms.length === 0 ) {
          data.isDataShow = true;
          data.emptyData = true;
        }
        // T가족모아 가입가능한 요금제
        // 실시간잔여량에 가족모아 데이터가 있는 경우 [DV001-13997])
        data.isTmoaInsProdId = TPLAN_PROD_ID.indexOf(data.svcInfo.prodId) > -1;
        if ( data.remnantData.tmoa && data.remnantData.tmoa.length > 0 ) {
          // 가입
          data.isTmoaData = true;
          data.family = data.remnantData.tmoa[0];
          data.family.remained = data.family.showRemained.data + data.family.showRemained.unit;
          // T가족모아 공유가능한 요금제
          data.isTmoaProdId = TPLAN_SHARE_ID.indexOf(data.svcInfo.prodId) > -1;
        }
      }

      // 자녀 회선 추가 수정 [DV001-15520]
      if ( child && child.length > 0 ) {
        const convertedChildLines = this.convertChildLines(child);
        if (convertedChildLines && convertedChildLines.length > 0) {
          data.otherLines = convertedChildLines.concat(data.otherLines);
        }
        // data.otherLines = Object.assign(this.convertChildLines(child), data.otherLines);
      }

      // 9차: PPS, T-Login, T-PocketFi 인 경우 다른회선 잔여량이 노출되지 않도록 변경
      if ( data.svcInfo.svcAttrCd === 'M2' || data.svcInfo.svcAttrCd === 'M3' || data.svcInfo.svcAttrCd === 'M4' ) {
        data.otherLines = [];
      }

      // SP9 즉시충전버튼 무조건 노출로 변경
      /*
      if ( svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4' /!* 기본 DATA 제공량이 없는 경우*!/ ) {
        // 비노출 조건 T-pocketFi or T-Login 인 경우와 기본제공량이 없는경우
        // 즉시충전버튼 영역
        data.immCharge = false;
      }
      */

      // 데이터혜택/활용하기 영역
      if ( data.svcInfo.svcAttrCd === 'M1'/* || svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4'*/ ) {
        // 휴대폰, T-pocketFi, T-Login  경우 노출 - 9차에서 휴대폰인 경우에만 노출
        data.isBenefit = true;
        // 선불쿠폰영역 휴대폰 인 경우에만 노출 (9차) - 11차에서 hidden 처리(190121)

        // if (String(process.env.NODE_ENV) !== 'prd') {
          // TODO: GrandOpen 때 enable 처리
          data.isPrepayment = true;
        // }
      }

      // T끼리 데이터선물버튼 영역
      if ( data.svcInfo.svcAttrCd === 'M2' || present ) {
        // PPS 인 경우에 자동알람서비스 우
        data.present = true;
      }

      // 리필쿠폰
      if ( refill && refill.length > 0 ) {
        data.refill = refill;
      }

      // 무선 여부 확인
      if ( SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1 ) {
        data.isWireLess = true;
      }

      // 다른 페이지를 찾고 계신가요 통계코드 추가
      this.getXtEid(data);
      const reqBkdArr: Array<any> = [];

      // 충전,선물 이력 건수 조회 후 이력이 있는 경우에만 해당 이력 API 호출(성능 개선건 반영)[DV001-13474]
      // PPS인 경우 데이터한도요금제 충전내역, 팅/쿠키즈/안심음성 충전내역만 조회
      if (this.isPPS) {
        reqBkdArr.push(this._getDataChargeBreakdown());
        reqBkdArr.push(this._getEtcChargeBreakdown());
      } else {
        if (!refillGiftHistory) {
          return this._render(res, data);
        }
        // 리필쿠폰 수혜, 제공 건수
        if ((refillGiftHistory.rifilRcvCnt && parseInt(refillGiftHistory.rifilRcvCnt, 10) > 0) ||
          (refillGiftHistory.rifilSndCnt && parseInt(refillGiftHistory.rifilSndCnt, 10) > 0)) {
          reqBkdArr.push(this._getRefillPresentBreakdown());
        }
        // 리필쿠폰 사용 건수
        if (refillGiftHistory.rifilUseCnt && parseInt(refillGiftHistory.rifilUseCnt, 10) > 0) {
          reqBkdArr.push(this._getRefillUsedBreakdown());
        }
        // T끼리데이터 선물, 수혜 건수
        if ((refillGiftHistory.tdataSndCnt && parseInt(refillGiftHistory.tdataSndCnt, 10) > 0) ||
          (refillGiftHistory.tdataRcvCnt && parseInt(refillGiftHistory.tdataRcvCnt, 10) > 0)) {
          reqBkdArr.push(this._getDataPresentBreakdown());
        }
        // 팅/쿠키즈/안심음성 충전내역 건수
        if (refillGiftHistory.tingIneeCnt && parseInt(refillGiftHistory.tingIneeCnt, 10) > 0) {
          reqBkdArr.push(this._getEtcChargeBreakdown());
        }
        // 데이터한도요금제 충전내역 건수
        if (refillGiftHistory.lmtChrgCnt && parseInt(refillGiftHistory.lmtChrgCnt, 10) > 0) {
          reqBkdArr.push(this._getDataChargeBreakdown());
        }
        // 팅요금 보낸선물내역, 받은선물내역 건수
        if ((refillGiftHistory.tingGiftRcvCnt && parseInt(refillGiftHistory.tingGiftRcvCnt, 10) > 0) ||
          (refillGiftHistory.tingGiftSndCnt && parseInt(refillGiftHistory.tingGiftSndCnt, 10) > 0) ) {
          reqBkdArr.push(this._getTingPresentBreakdown());
        }
      }

      if (reqBkdArr.length <= 0) {
        return this._render(res, data);
      }

      // 최근 충전 및 선물 내역
      Observable.combineLatest(reqBkdArr).subscribe(histories => {
        // 충전/선불내역 페이지와 동일한 순서(myt-data.history.controller.ts)
        const lengthHistory = histories && histories.length || 0;
        // if (lengthHistory > 0) {
          const breakdownList: Array<any> = [];
          for (let i = 0; i < lengthHistory; i += 1) {
            const history = histories[i];
            switch (history.cmd) {
              case 'BFF_06_0018': {
                // T끼리 선물하기 내역
                // type: 1 send, 2 recharge
                const dpBkd = history.result;
                dpBkd.map((item) => {
                  const dataQty = FormatHelper.convDataFormat(item.dataQty, 'MB');
                  let uSubTitle = FormatHelper.conTelFormatWithDash(item.svcNum);
                  if ( item.giftType === 'GC' ) {
                    uSubTitle = MYT_DATA_CHARGE_TYPES.FIXED + ' | ' + uSubTitle;
                  }
                  item['opDt'] = item.opDtm || item.opDt;
                  item['class'] = (item.type === '1' ? 'send' : 'recieve');
                  item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                  item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.DATA_GIFT;
                  // 충전/선물내역과 동일하게 처리
                  item['u_sub'] = uSubTitle;
                  item['d_title'] = dataQty.data;
                  item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
                  item['unit'] = dataQty.unit;
                });
                breakdownList.push(dpBkd);
                break;
              }
              case 'BFF_06_0042': {
                // 데이터한도요금제 충전내역
                const dcBkd = history.result;
                dcBkd.map((item) => {
                  if ( this.isPPS ) {
                    item['opDt'] = item.chargeDtm || item.chargeDt;
                    item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
                    item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                    item['u_type'] = 'data';
                    item['u_title'] = PREPAID_PAYMENT_PAY_CD[item.payCd];
                    item['u_sub'] = item.wayCd === '02' ? item.cardNm : PREPAID_PAYMENT_TYPE[item.wayCd];
                    item['d_title'] = FormatHelper.addComma(item.amt);
                    item['d_sub'] = item.data;
                    item['unit'] = CURRENCY_UNIT.WON;
                  } else {
                    let uSubTitle = item.opOrgNm || ETC_CENTER;
                    if ( item.opTypCd === '3' ) {
                      uSubTitle = MYT_DATA_CHARGE_TYPES.FIXED + ' | ' + uSubTitle;
                    }
                    item['opDt'] = item.opDtm || item.opDt;
                    item['class'] = 'recharge';
                    item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                    item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.LIMIT_CHARGE;
                    item['u_sub'] = uSubTitle;
                    item['d_title'] = FormatHelper.addComma(item.amt);
                    item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
                    item['unit'] = CURRENCY_UNIT.WON;
                  }
                });
                breakdownList.push(dcBkd);
                break;
              }
              case 'BFF_06_0032': {
                // 팅/쿠키즈/안심요금 충전 내역
                // 자동충전취소내역 제거
                let etcBkd;
                if ( !this.isPPS ) {
                  etcBkd = history.result.filter((item) => {
                    return item.opTypCd !== '4';
                  });
                } else {
                  etcBkd = history.result;
                }
                etcBkd.map((item) => {
                  if ( this.isPPS ) {
                    item['opDt'] = item.chargeDtm || item.chargeDt;
                    item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
                    item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                    item['u_type'] = 'voice';
                    item['u_title'] = PREPAID_PAYMENT_PAY_CD[item.payCd];
                    item['u_sub'] = item.wayCd === '02' ? item.cardNm : PREPAID_PAYMENT_TYPE[item.wayCd];
                    item['d_title'] = FormatHelper.addComma(item.amt);
                    item['d_sub'] = item.data;
                    item['unit'] = CURRENCY_UNIT.WON;
                  } else {
                    let etcBottom = item.opOrgNm || ETC_CENTER;
                    if ( item.opTypCd === '2' || item.opTypCd === '4' ) {
                      etcBottom = MYT_DATA_CHARGE_TYPES.CANCEL + ' | ' + etcBottom;
                    } else if ( item.opTypCd === '3' ) {
                      etcBottom = MYT_DATA_CHARGE_TYPES.FIXED + ' | ' + etcBottom;
                    }
                    item['opDt'] = item.opDtm || item.opDt;
                    item['class'] = 'recharge';
                    item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                    item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_CHARGE;
                    item['u_sub'] = etcBottom;
                    item['d_title'] = FormatHelper.addComma(item.amt);
                    item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
                    item['unit'] = CURRENCY_UNIT.WON;
                  }
                });
                breakdownList.push(etcBkd);
                break;
              }
              case 'BFF_06_0026': {
                // 팅요금 선물하기 내역
                // opTypCd: 1 send, 2 recharge
                const tpBkd = history.result;
                tpBkd.map((item) => {
                  item['opDt'] = item.opDtm || item.opDt;
                  item['class'] = (item.opTypCd === '1' ? 'send' : 'recieve');
                  item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                  item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_GIFT;
                  // custNm 명세서에서 제외됨
                  item['u_sub'] = /*item.custNm ||  + ' | ' +*/ FormatHelper.conTelFormatWithDash(item.svcNum);
                  item['d_title'] = FormatHelper.addComma(item.amt);
                  item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
                  item['unit'] = CURRENCY_UNIT.WON;
                });
                breakdownList.push(tpBkd);
                break;
              }
              case 'BFF_06_0002': {
                // 리필쿠폰 사용이력조회
                const refuBkd = history.result;
                refuBkd.map((item) => {
                  item['opDt'] = item.copnUseDtm || item.copnUseDt;
                  item['class'] = 'recharge';
                  item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                  item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_USAGE;
                  item['u_sub'] = item.opOrgNm || ETC_CENTER;
                  item['d_title'] = REFILL_USAGE_DATA_CODES.indexOf(item.copnDtlClCd) >= 0 ? MYT_DATA_REFILL_TYPES.DATA : MYT_DATA_REFILL_TYPES.VOICE;
                  item['d_sub'] = DateHelper.getShortDate(item.copnUseDtm || item.copnUseDt);
                  item['unit'] = '';
                });
                breakdownList.push(refuBkd);
                break;
              }
              case 'BFF_06_0003': {
                // 리필쿠폰 선물 내역
                const refpBkd = history.result;
                refpBkd.map((item) => {
                  item['opDt'] = item.copnOpDtm || item.copnOpDt;
                  item['class'] = (item.type === '1' ? 'send' : 'recieve');
                  item['badge_str'] = MYT_DATA_HISTORY[item['class']];
                  item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_GIFT;
                  item['u_sub'] = FormatHelper.conTelFormatWithDash(item.svcNum);
                  item['d_title'] = ''; // API response 값에 정의되어있지 않음
                  item['d_sub'] = DateHelper.getShortDate(item.copnOpDtm || item.copnOpDt);
                  item['unit'] = '';
                });
                breakdownList.push(refpBkd);
                break;
              }
              default:
                break;
            }
            // TODO: breakdownList를 for-loop 후에 처리해도될 것 같음
            if ( breakdownList.length > 0 ) {
              data.breakdownList = this.sortBreakdownItems(breakdownList).slice(0, 3);
            }
          }
        // }
        this._render(res, data);
      });
    });
  }

  convShowData(data: any) {
    // 실시간데이터 잔여량 표기 방법 표시
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
    // 실시간데이터 잔여량 표기 방법 표시
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

  convFormat(data: string, unit: string): any {
    // 실시간데이터 잔여량 데이터 포맷 설정
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
      case UNIT_E.VOICE_2:
      case UNIT_E.VOICE_3:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.FEE:
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }

  parseRemnantData(remnant: any, data: any): any {
    // 실시간잔여량 데이터 parse
    const svcInfo = data.svcInfo;
    const result: any = {
      gdata: [],
      sdata: [],
      voice: [],
      sms: [],
      tmoa: [],
      // _5gxTicket: null,
      totalLimit: false,
      total: null
    };
    if (svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE && remnant.balance) {
      const voice = remnant.balance[0];
      if ( voice ) {
        this.convShowData(voice);
        result['voice'].push(voice);
      }
      const sms = remnant.balance[1];
      if ( sms ) {
        this.convShowData(sms);
        result['sms'].push(sms);
      }
      return result;
    }
    // 범용 데이터
    const gnrlData = remnant['gnrlData'] || [];
    // 5GX 데이터
    const data5gx = remnant._5gxData || []; // 5GX 시간권/장소권 공제항목
    // 특수 데이터
    const spclData = remnant['spclData'] || [];
    const voiceData = remnant['voice'] || [];
    const smsData = remnant['sms'] || [];
    let tmoaRemained = 0;
    let tmoaTotal = 0;
    let etcRemained = 0;
    let etcTotal = 0;
    // [OP002-3871] 5GX 시간권/장소권 사용 여부 확인
    if (data5gx.length > 0) {
      data._5gxTicket = {};
      data5gx.forEach(item => {
        const index5GXTicket = _5GXTICKET_PROD_ID.indexOf(item.prodId);
        // Data 시간권인 여부
        if (_5GXTICKET_PROD_ID.isTimeTicket(index5GXTicket)) {
          data._5gxTicket.time = true;
        }
        // Data 시간권인 경우, 사용 여부
        if (data._5gxTicket.time && !_5GXTICKET_TIME_SET_SKIP_ID.includes(item.skipId)) {
          // 공제코드(skipId: "DSGK1") "시간권 데이터"가 없으면, 남은 시간 표시 ("사용중"이 아님)
          // 시간으로 오는 것이 SB(20190919) v0.91 까지는 고정
          // TODO: 단위 변환등은 모두 취합하여 한 함수로 이동 static으로구현 해보자!
          // data._5gxTicket.total = parceTimesString(this.convFormat(item.total, item.unit));
          data._5gxTicket.remained = parceTimesString(this.convFormat(item.remained, item.unit));
        }
      });
    }
    // if ( gnrlData.length > 0 ) {
      gnrlData.forEach(item => {
        this.convShowData(item);
        // 반복해서 값을 비교할 필요가 없도록 개선
        if ( !result.totalLimit && item.unlimit === '1' || item.unlimit === 'B' || item.unlimit === 'M' ) {
          result.totalLimit = true;
        }
        // POT10, POT20
        if ( item.skipId === skipIdList[0] || item.skipId === skipIdList[1] ) {
          result.tmoa.push(item);
          // totalLimit가 true면 개산 필요없음
          // [OP002-3871] 5GX 시간권/장소권은 tmoa에 포함될 수 없어 보인다.
          if (!result.totalLimit) {
            tmoaRemained += parseInt(item.remained || 0, 10);
            tmoaTotal += parseInt(item.total || 0, 10);
          }
        } else {
          result.gdata.push(item);
          // 차감중인 공제 항목에 데이터의 합 [DVI001-15208] 참고
          // totalLimit가 true면 개산 필요없음
          if (!result.totalLimit) {
            etcRemained += parseInt(item.remained || 0, 10);
            etcTotal += parseInt(item.total || 0, 10);
          }
        }
      });
      result.total = result.totalLimit ? {
        etcRemainedRatio: 100,
        totalRemainedRatio: 0
      } : this.calculationData(tmoaRemained, tmoaTotal, etcRemained, etcTotal);
    // }
    // if ( spclData.length > 0 ) {
      spclData.forEach(item => {
        this.convShowData(item);
        // if ( skipIdList.indexOf(item.skipId) === -1 ) {
        result.sdata.push(item);
        // }
      });
    // }
    // if ( voiceData.length > 0 ) {
      voiceData.forEach(item => {
        this.convShowData(item);
        result.voice.push(item);
      });
    // }
    // if ( smsData.length > 0 ) {
      smsData.forEach((item) => {
        this.convShowData(item);
        result.sms.push(item);
      });
    // }
    return result;
  }

  convertChildLines(items): any {
    // 자녀회선 분리코드
    const list: any = [];
    items.filter((item) => {
      list.push({
        child: true,
        nickNm: item.childEqpMdNm || item.eqpMdlNm, // item.mdlName 서버데이터 확인후 변경
        svcNum: StringHelper.phoneStringToDash(item.svcNum),
        svcMgmtNum: item.svcMgmtNum
      });
    });
    return list;
  }

  compare(a, b) {
    // 다른회선조회시 순서 정렬
    const codeA = a.svcAttrCd.toUpperCase();
    const codeB = b.svcAttrCd.toUpperCase();

    let comparison = 0;
    if ( codeA > codeB ) {
      comparison = 1;
    } else if ( codeA < codeB ) {
      comparison = -1;
    }
    return comparison;
  }

  convertOtherLines(target, items): any {
    // 다른 회선은 휴대폰만 해당;
    let lines = [];
    const m = (items && items['m']) || [];
    let s = (items && items['s']) || [];
    s = s.filter((_data) => {
      return _data.svcAttrCd === SVC_ATTR_E.TELEPHONE && S_FLAT_RATE_PROD_ID.indexOf(_data.prodId) !== -1;
    });

    const list: any = [];
    // 간편로그인인 경우는 다른 회선 정보 노출 하지않도록 처리
    if ( target.loginType === LOGIN_TYPE.EASY ) {
      return list;
    }
    if (m.length > 0) {
      lines = lines.concat(m);
    }
    if (s.length > 0) {
      lines = lines.concat(s);
    }
    lines.sort(this.compare);
    if ( lines.length > 0 ) {
      const nOthers: any = Object.assign([], lines);
      nOthers.filter((item) => {
        if ( target.svcMgmtNum !== item.svcMgmtNum ) {
          // 닉네임이 없는 경우 팻네임이 아닌  서비스 그룹명으로 노출 [DV001-14845]
          // item.nickNm = item.nickNm || item.eqpMdlNm;
          item.nickNm = item.nickNm || SVC_ATTR_NAME[item.svcAttrCd];
          item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
          list.push(item);
        }
      });
    }
    return list;
  }

  sortBreakdownItems(items): any {
    // 최근 충전/선물 내역 정렬
    return Array.prototype.concat.apply([], items).sort((a, b) => {
      if ( a.opDt > b.opDt ) {
        return -1;
      } else if ( a.opDt < b.opDt ) {
        return 1;
      }
      return 0;
    });
  }

  // 실시간잔여량
  _getRemnantData(svcInfo: any): Observable<any> {
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {}).map((_resp) => {
      const resp = JSON.parse(JSON.stringify(_resp));
      if ( resp.code === API_CODE.CODE_00 ) {
        // XXX: 5GX 개발을 위해 가짜 데이터 추가
        resp.result.gnrlData.push(
            // 1. 시간권, 설정 ON: "사용중" 표시
            {
              'prodId': 'NA00006732', // 'NA00006732', 'NA00006733'
              'prodNm': '스탠다드0 시간권',
              'skipId': 'DD4J2', // DD4J3, DD4J2, DD4J1
              'skipNm': 'Data 시간권 60시간',
              'unlimit': '0',
              'total': '108000',
              'used': '4920',
              'remained': '103080',
              'unit': '240',
              'rgstDtm': '',
              'exprDtm': ''
            },
            {
              'prodId': 'NA00006732', // 'NA00006731', 'NA00006733'
              'prodNm': '스탠다드0 시간권',
              'skipId': 'DSGK1',
              'skipNm': '시간권 데이터',
              'unlimit': '1',
              'total': '499999999',
              'used': '0',
              'remained': '499999999',
              'unit': '140',
              'rgstDtm': '20190918172423',
              'exprDtm': '20190918174423'
            }
            /*
            // 1. 시간권, 설정 OFF: 남은 시간("00시간[ 00분] 남음") 표시
            {
              'prodId': 'NA00006732', // 'NA00006732', 'NA00006733'
              'prodNm': '스탠다드0 시간권',
              'skipId': 'DD4J2', // DD4J3, DD4J2, DD4J1
              'skipNm': 'Data 시간권 60시간',
              'unlimit': '0',
              'total': '108000',
              'used': '4920',
              'remained': '103080',
              'unit': '240',
              'rgstDtm': '',
              'exprDtm': ''
            }
            */
            /*
            // 2. 장소권 (부스트 파크 옵션): 표시 없음
            {
              'prodId': 'NA00006734', // 'NA00006735', 'NA00006736'
              'prodNm': 'BoostPark 데이터통화 10GB',
              'skipId': 'DD4J6', // DD4J5, DD4J4
              'skipNm': 'YT55_장소권',
              'unlimit': '0',
              'total': '9000',
              'used': '0',
              'remained': '7200',
              'unit': '240',
              'rgstDtm': '',
              'exprDtm': ''
            }
            */);
        // [OP002-3871] 5GX 항목은 별도 항목으로 추출
        const gnrlData = resp.result.gnrlData;
        const _5gxData = gnrlData.reduce((acc, item, index) => {
          if (_5GXTICKET_PROD_ID.includes(item.prodId)) {
            acc.push(item);
            gnrlData.splice(index, 1);
          }
          return acc;
        }, []);
        if (_5gxData.length > 0) {
          resp.result._5gxData = _5gxData;
        }
        if ( SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1 ) {
          return resp.result;
        }
        // 집전화 정액제 상품을 제외하고 에러처리
        if (svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE && S_FLAT_RATE_PROD_ID.indexOf(svcInfo.prodId) !== -1) {
          return resp.result;
        } else {
          return {
            info: {
              code: 'BLN0004'
            }
          };
        }
      } else {
        // error
        const info = resp;
        info['isBlock'] = 'N';
        if ( resp.code === API_CODE.BFF_0006 ) {
          if (resp.result.fromDtm) {
            info['fromDate'] = DateHelper.getShortDateAnd24Time(resp.result.fromDtm);
          }
          if (resp.result.toDtm) {
            info['toDate'] = DateHelper.getShortDateAnd24Time(resp.result.toDtm);
          }
        }
        if (resp.code === API_CODE.BFF_0006 || resp.code === API_CODE.BFF_0011) {
          info['fallbackClCd'] = resp.result.fallbackClCd;
          info['fallbackUrl'] = resp.result.fallbackUrl;
          info['fallbackMsg'] = resp.result.fallbackMsg;
          if (info['fallbackClCd'] === 'F0001') {
            info['isBlock'] = 'Y';
          }
        }
        return {
          info: info
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

  // T끼리 데이터 선물 버튼
  _getDataPresent() {
    return this.apiService.request(API_CMD.BFF_06_0015, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 || resp.code === 'GFT0003' || resp.code === 'GFT0004' ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  // T 끼리 선물하기 선물내역 (1년기준)
  _getDataPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0018, {
      fromDt: this.fromDt,
      toDt: this.toDt,
      type: '0' // 0: all, 1: send, 2: recharge
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return {
          cmd: 'BFF_06_0018',
          result: resp.result
        };
      } else {
        // error
        return null;
      }
    });
  }

  // 팅요금 선물내역
  _getTingPresentBreakdown() {
    return this.apiService.request(API_CMD.BFF_06_0026, {
      fromDt: this.fromDt,
      toDt: this.toDt
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return {
          cmd: 'BFF_06_0026',
          result: resp.result
        };
      } else {
        // error
        return null;
      }
    });
  }

  // 데이터한도요금제 충전내역
  _getDataChargeBreakdown() {
    let url = API_CMD.BFF_06_0042;
    let params = {};
    if ( this.isPPS ) {
      url = API_CMD.BFF_06_0063;
      params = {
        pageNum: 1,
        rowNum: 10
      };
    } else {
      params = {
        fromDt: this.fromDt,
        toDt: this.toDt,
        type: 1
      };
    }
    return this.apiService.request(url, params).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( this.isPPS ) {
          return {
            cmd: 'BFF_06_0042',
            result: resp.result.history
          };
        } else {
          return {
            cmd: 'BFF_06_0042',
            result: resp.result
          };
        }
      } else {
        // error
        return null;
      }
    });
  }

  // 팅/쿠키즈/안심음성 충전내역
  _getEtcChargeBreakdown() {
    let url = API_CMD.BFF_06_0032;
    let params = {};
    if ( this.isPPS ) {
      url = API_CMD.BFF_06_0062;
      params = {
        pageNum: 1,
        rowNum: 10
      };
    } else {
      params = {
        fromDt: this.fromDt,
        toDt: this.toDt
      };
    }
    return this.apiService.request(url, params).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( this.isPPS ) {
          return {
            cmd: 'BFF_06_0032',
            result: resp.result.history
          };
        } else {
          return {
            cmd: 'BFF_06_0032',
            result: resp.result
          };
        }
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
        return {
          cmd: 'BFF_06_0002',
          result: resp.result
            .filter(item => {
              // 1년이내
              return DateHelper.getDifference((item.copnUseDtm || item.copnUseDt).substring(0, 8), this.fromDt) >= 0;
            })
        };
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
        return {
          cmd: 'BFF_06_0003',
          result: resp.result
            .filter(item => {
              // 1년이내
              return DateHelper.getDifference((item.copnOpDtm || item.copnOpDt).substring(0, 8), this.fromDt) >= 0;
            })
        };
      } else {
        // error
        return null;
      }
    });
  }

  // PPS 자동알람설정내역
  _getPPSAutoAlarm() {
    return this.apiService.request(API_CMD.BFF_06_0075, {});
  }

  // PPS 음성자동충전내역
  _getPPSAutoInfo() {
    return this.apiService.request(API_CMD.BFF_06_0060, {});
  }

  // 충전 선물 이력 건수 조회
  _reqRefillGiftHistory(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0077, {
      fromDt: this.fromDt,
      toDt: this.toDt
    }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       'code': '00',
    //       'msg': 'success',
    //       'result' : {
    //         'rifilSndCnt': '1',
    //         'rifilUseCnt': '1',
    //         'tdataSndCnt': '1',
    //         'tdataRcvCnt': '1',
    //         'tingIneeCnt': '1',
    //         'lmtChrgCnt': '1',
    //         'tingGiftRcvCnt': '1',
    //         'tingGiftSndCnt': '1'
    //       }
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(null);
    //       observer.complete();
    //     } else {
    //       observer.error(resp);
    //     }
    //   }, 500);
    // });
  }

  _render(res, data) {
    // 음성충전알람서비스 신청 내역 - 13차
    if ( this.isPPS ) {
      // DV001-13280 - 음성자동충전, 자동알림 신청과 관계없이 버튼 노출
      // Observable.combineLatest(
      //   this._getPPSAutoAlarm(),
      //   this._getPPSAutoInfo()
      // ).subscribe(([alarm, info]) => {
      //   if ( alarm.code === API_CODE.CODE_00 ) {
      //     // 음성 자동 충전 되어 있지 않은 경우 버튼 노출
      //     if ( alarm.result.typeCd === 0 ) {
      //       data.ppsAlarm = true;
      //     }
      //   }
      //   if ( info.code === API_CODE.CODE_00 ) {
      //     // 자동알람 신청이 되어 있지 않은 경우 버튼 노출
      //     if ( FormatHelper.isEmpty(info.result.amtCd) ) {
      //       data.ppsInfo = true;
      //     }
      //   }
      //   res.render('myt-data.submain.html', { data });
      // });
      res.render('myt-data.submain.html', { data });
    } else {
      /**
       * T가족모아 관련 내용 - 공유데이터(실시간잔여량에 조회된 데이터)
       * 1. 가입이 가능한 요금제이나 공유불가능한 요금제 & 공유데이터가 있는 경우 (자세히 버튼노출)
       * 2. 가입이 불가한 요금제이지만 가족모아 데이터가 있는 경우 (자세히 버튼노출)
       * 3. 가입이 가능한 요금제이면서 공유가능한 요금제
       *  3-1 미성년자 인 경우 (자세히 버튼노출)
       *  3-2 공유가능한 데이터가 0인 경우 (공유 버튼노출)
       *  3-3 공유가능한 데이터가 있는 경우 (자세히 버튼노출)
       * 4. 공유데이터가 있고 가입이 가능한 요금제 인 경우 (가입 안내버튼 및 메시지 노출)
       */
      // T가족모아 공유 및 가입이 가능 한 경우
      if ( data.isTmoaProdId && data.isTmoaProdId ) {
        this.apiService.request(API_CMD.BFF_06_0044, {}).subscribe((family) => {
          if ( family.code === API_CODE.CODE_00 ) {
            // 미성년자인 경우
            if ( family.result.adultYn === 'N' ) {
              data.isTmoaProdId = false;
            }
            // 공유가능데이터가 0인 경우 공유버튼 노출
            if ( family.result.total !== '0' ) {
              data.isTmoaProdId = false;
            }
          }
          res.render('myt-data.submain.html', { data });
        });
      } else {
        // 가입이 가능한 경우에만
        res.render('myt-data.submain.html', { data });
      }
    }
  }

  /**
   * 다른 페이지를 찾고 계신가요 통계코드 생성
   * @param data
   */
  private getXtEid(data: any): any {
    const eid = {
      hotdata     : 'CMMA_A3_B10-6',    // 실시간 잔여량
      guide       : 'CMMA_A3_B10-7',    // 요금 안내서
      hotbill     : 'CMMA_A3_B10-8',    // 실시간 이용요금
      additions   : 'CMMA_A3_B10-9',    // 나의 부가서비스
      roaming     : 'CMMA_A3_B10-10',   // 나의 T로밍 이용현황
      benefit     : 'CMMA_A3_B10-11',   // 혜택/할인
      mobileplan  : 'CMMA_A3_B10-12'    // 요금제
    };

    if (data.svcInfo.svcAttrCd === SVC_ATTR_E.PPS) {
      Object.assign(eid, {
        guide       : 'CMMA_A3_B10-13',   // 요금 안내서
        myplan      : 'CMMA_A3_B10-14',   // 나의 요금제
        additions   : 'CMMA_A3_B10-15',   // 나의 부가서비스
        roaming     : 'CMMA_A3_B10-16'    // 나의 T로밍 이용현황
      });
    } else if (!data.isWireLess) {
      Object.assign(eid, {
        guide         : 'CMMA_A3_B10-17',   // 요금 안내서
        myplan        : 'CMMA_A3_B10-18',   // 나의 요금제
        combinations  : 'CMMA_A3_B10-19',   // 결합상품
        combiDiscount : 'CMMA_A3_B10-20',   // 결합할인
        wireplan      : 'CMMA_A3_B10-21'    // 인터넷/전화/IPTV
      });
    }

    data.xtEid = eid;
  }
}

export default MytDataSubmainController;

