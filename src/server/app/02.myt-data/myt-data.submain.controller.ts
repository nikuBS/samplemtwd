/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.14
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import FormatHelper from '../../utils/format.helper';
import DateHelper from '../../utils/date.helper';
import { CURRENCY_UNIT, ETC_CENTER, MYT_DATA_CHARGE_TYPE_NAMES, MYT_DATA_CHARGE_TYPES, MYT_DATA_REFILL_TYPES } from '../../types/string.type';
import BrowserHelper from '../../utils/browser.helper';
import { LOGIN_TYPE, PREPAID_PAYMENT_PAY_CD, PREPAID_PAYMENT_TYPE, REFILL_USAGE_DATA_CODES, SVC_ATTR_NAME, UNIT, UNIT_E } from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';

// 실시간잔여량 공제항목
const skipIdList: any = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];
// T가족모아 공유 가능 요금제
const tmoaBelongToProdList: any = ['NA00005959', 'NA00005958'];
// T가족모아 가입 가능 요금제
const tmoaInsertToProdList: any = ['NA00005959', 'NA00005958', 'NA00005957', 'NA00005956', 'NA00005955', 'NA00006157', 'NA00006156',
  'NA00006155', 'NA00005627', 'NA00005628', 'NA00005629', 'NA00004891', 'NA00004769', 'NA00004770', 'NA00004771', 'NA00004772', 'NA00004773',
  'NA00004792', 'NA00004793', 'NA00004794', 'NA00004796', 'NA00004808', 'NA00004809', 'NA00004810', 'NA00004811', 'NA00004812', 'NA00004813',
  'NA00005012', 'NA00005013', 'NA00005014', 'NA00005016', 'NA00005017', 'NA00005134', 'NA00005292', 'NA00005293', 'NA00004825', 'NA00004826',
  'NA00004827', 'NA00004828', 'NA00004829', 'NA00004830', 'NA00004775', 'NA00004790', 'NA00004791'];

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
      isApp: BrowserHelper.isApp(req)
    };
    this.isPPS = (data.svcInfo.svcAttrCd === 'M2');
    Observable.combineLatest(
      this._getRemnantData(),
      this._getDataPresent(),
      this._getRefillCoupon(),
      // this._getPrepayCoupon(),
      this._getDataChargeBreakdown(),
      this._getDataPresentBreakdown(),
      this._getTingPresentBreakdown(),
      this._getEtcChargeBreakdown(),
      this._getRefillPresentBreakdown(),
      this._getRefillUsedBreakdown()
      // this.redisService.getData(REDIS_KEY.BANNER_ADMIN + pageInfo.menuId),
    ).subscribe(([remnant, present, refill, dcBkd, dpBkd, tpBkd, etcBkd, refpBkd, refuBkd /*,banner*/]) => {
      if ( remnant.info ) {
        data.remnant = remnant;
      } else {
        data.remnantData = this.parseRemnantData(remnant);
        if ( data.remnantData.gdata && data.remnantData.gdata.length > 0 ) {
          data.isDataShow = true;
        }
        if ( data.remnantData.sdata && data.remnantData.sdata.length > 0 ) {
          data.isSpDataShow = true;
        }
        if ( data.remnantData.voice && data.remnantData.voice.length > 0 ) {
          data.isVoiceShow = true;
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
        data.isTmoaInsProdId = tmoaInsertToProdList.indexOf(data.svcInfo.prodId) > -1;
        if ( data.remnantData.tmoa && data.remnantData.tmoa.length > 0 ) {
          // 가입
          data.isTmoaData = true;
          data.family = data.remnantData.tmoa[0];
          data.family.remained = data.family.showRemained.data + data.family.showRemained.unit;
          // T가족모아 공유가능한 요금제
          data.isTmoaProdId = tmoaBelongToProdList.indexOf(data.svcInfo.prodId) > -1;
        }
      }

      if ( child && child.length > 0 ) {
        data.otherLines = Object.assign(this.convertChildLines(child), data.otherLines);
      }
      // 9차: PPS, T-Login, T-PocketFi 인 경우 다른회선 잔여량이 노출되지 않도록 변경
      if ( data.svcInfo.svcAttrCd === 'M2' || data.svcInfo.svcAttrCd === 'M3' || data.svcInfo.svcAttrCd === 'M4' ) {
        data.otherLines = [];
      }
      // SP9 즉시충전버튼 무조건 노출로 변경
      /*if ( svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4' /!* 기본 DATA 제공량이 없는 경우*!/ ) {
        // 비노출 조건 T-pocketFi or T-Login 인 경우와 기본제공량이 없는경우
        // 즉시충전버튼 영역
        data.immCharge = false;
      }*/
      if ( data.svcInfo.svcAttrCd === 'M1'/* || svcInfo.svcAttrCd === 'M3' || svcInfo.svcAttrCd === 'M4'*/ ) {
        // 데이터혜택/활용하기 영역
        // 휴대폰, T-pocketFi, T-Login  경우 노출 - 9차에서 휴대폰인 경우에만 노출
        data.isBenefit = true;
        // 선불쿠폰영역 휴대폰 인 경우에만 노출 (9차) - 11차에서 hidden 처리(190121)
        // TODO: GrandOpen 때 enable 처리
        // data.isPrepayment = true;
      }

      if ( data.svcInfo.svcAttrCd === 'M2' || present ) {
        // PPS 인 경우에 자동알람서비스 우
        // T끼리 데이터선물버튼 영역
        data.present = true;
      }
      if ( refill && refill.length > 0 ) {
        // 리필쿠폰
        data.refill = refill;
      }

      // 최근 충전 및 선물 내역
      // 충전/선불내역 페이지와 동일한 순서(myt-data.history.controller.ts)
      const breakdownList: any = [];
      if ( dpBkd && dpBkd.length > 0 ) {
        // T끼리 선물하기 내역
        // type: 1 send, 2 recharge
        dpBkd.map((item) => {
          const dataQty = FormatHelper.convDataFormat(item.dataQty, 'MB');
          let uSubTitle = FormatHelper.conTelFormatWithDash(item.svcNum);
          if ( item.giftType === 'GC' ) {
            uSubTitle = MYT_DATA_CHARGE_TYPES.FIXED + ' | ' + uSubTitle;
          }
          item['opDt'] = item.opDtm || item.opDt;
          item['class'] = (item.type === '1' ? 'send' : 'recieve');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.DATA_GIFT;
          // 충전/선물내역과 동일하게 처리
          item['u_sub'] = uSubTitle;
          item['d_title'] = dataQty.data;
          item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
          item['unit'] = dataQty.unit;
        });
        breakdownList.push(dpBkd);
      }
      if ( dcBkd && dcBkd.length > 0 ) {
        // 데이터한도요금제 충전내역
        dcBkd.map((item) => {
          if ( this.isPPS ) {
            item['opDt'] = item.chargeDtm || item.chargeDt;
            item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
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
            item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.LIMIT_CHARGE;
            item['u_sub'] = uSubTitle;
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
            item['unit'] = CURRENCY_UNIT.WON;
          }
        });
        breakdownList.push(dcBkd);
      }
      if ( etcBkd && etcBkd.length > 0 ) {
        // 팅/쿠키즈/안심요금 충전 내역
        etcBkd.map((item) => {
          if ( this.isPPS ) {
            item['opDt'] = item.chargeDtm || item.chargeDt;
            item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
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
            item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_CHARGE;
            item['u_sub'] = etcBottom;
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
            item['unit'] = CURRENCY_UNIT.WON;
          }
        });
        breakdownList.push(etcBkd);
      }
      if ( tpBkd && tpBkd.length > 0 ) {
        // 팅요금 선물하기 내역
        // opTypCd: 1 send, 2 recharge
        tpBkd.map((item) => {
          item['opDt'] = item.opDtm || item.opDt;
          item['class'] = (item.opTypCd === '1' ? 'send' : 'recieve');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_GIFT;
          // custNm 명세서에서 제외됨
          item['u_sub'] = /*item.custNm ||  + ' | ' +*/ FormatHelper.conTelFormatWithDash(item.svcNum);
          item['d_title'] = FormatHelper.addComma(item.amt);
          item['d_sub'] = DateHelper.getShortDate(item.opDtm || item.opDt);
          item['unit'] = CURRENCY_UNIT.WON;
        });
        breakdownList.push(tpBkd);
      }
      if ( refuBkd && refuBkd.length > 0 ) {
        // 리필쿠폰 사용이력조회
        refuBkd.map((item) => {
          item['opDt'] = item.copnUseDtm || item.copnUseDt;
          item['class'] = 'recharge';
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_USAGE;
          item['u_sub'] = item.opOrgNm || ETC_CENTER;
          item['d_title'] = REFILL_USAGE_DATA_CODES.indexOf(item.copnDtlClCd) >= 0 ? MYT_DATA_REFILL_TYPES.DATA : MYT_DATA_REFILL_TYPES.VOICE;
          item['d_sub'] = DateHelper.getShortDate(item.copnUseDtm || item.copnUseDt);
          item['unit'] = '';
        });
        breakdownList.push(refuBkd);
      }
      if ( refpBkd && refpBkd.length > 0 ) {
        // 리필쿠폰 선물 내역
        refpBkd.map((item) => {
          item['opDt'] = item.copnOpDtm || item.copnOpDt;
          item['class'] = (item.type === '1' ? 'send' : 'recieve');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_GIFT;
          item['u_sub'] = FormatHelper.conTelFormatWithDash(item.svcNum);
          item['d_title'] = ''; // API response 값에 정의되어있지 않음
          item['d_sub'] = DateHelper.getShortDate(item.copnOpDtm || item.copnOpDt);
          item['unit'] = '';
        });
        breakdownList.push(refpBkd);
      }
      if ( breakdownList.length > 0 ) {
        data.breakdownList = this.sortBreakdownItems(breakdownList).slice(0, 3);
      }
      // 배너 정보 - client에서 호출하는 방식으로 변경 (19/01/22)
      // if ( banner && (banner.code === API_CODE.REDIS_SUCCESS) ) {
      //   if ( !FormatHelper.isEmpty(banner.result) ) {
      //     data.banner = this.parseBanner(banner.result);
      //   }
      // }

      // 음성충전알람서비스 신청 내역 - 13차
      if ( this.isPPS ) {
        Observable.combineLatest(
          this._getPPSAutoAlarm(),
          this._getPPSAutoInfo()
        ).subscribe(([alarm, info]) => {
          if ( alarm.code === API_CODE.CODE_00 ) {
            // 음성 자동 충전 되어 있지 않은 경우 버튼 노출
            if ( alarm.result.typeCd === 0 ) {
              data.ppsAlarm = true;
            }
          }
          if ( info.code === API_CODE.CODE_00 ) {
            // 자동알람 신청이 되어 있지 않은 경우 버튼 노출
            if ( FormatHelper.isEmpty(info.result.amtCd) ) {
              data.ppsInfo = true;
            }
          }
          res.render('myt-data.submain.html', { data });
        });
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

  convFormat(data: string, unit: string): string {
    // 실시간데이터 잔여량 데이터 포맷 설정
    switch ( unit ) {
      case UNIT_E.DATA:
        return FormatHelper.convDataFormat(data, UNIT[unit]);
      case UNIT_E.VOICE:
        return FormatHelper.convVoiceFormat(data);
      case UNIT_E.FEE:
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data);
      default:
    }
    return '';
  }

  parseRemnantData(remnant: any): any {
    // 실시간잔여량 데이터 parse
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
          tmoaRemained += parseInt(item.remained || 0, 10);
          tmoaTotal += parseInt(item.total || 0, 10);
        } else {
          result['gdata'].push(item);
          etcRemained += result.totalLimit ? 100 : parseInt(item.remained || 0, 10);
          etcTotal += result.totalLimit ? 100 : parseInt(item.total || 0, 10);
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
    const MOBILE = (items && items['m']) || [];
    const list: any = [];
    // 간편로그인인 경우는 다른 회선 정보 노출 하지않도록 처리
    if ( target.loginType === LOGIN_TYPE.EASY ) {
      return list;
    }
    MOBILE.sort(this.compare);
    if ( MOBILE.length > 0 ) {
      const nOthers: any = Object.assign([], MOBILE);
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
        return resp.result;
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
        return resp.result;
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
          return resp.result.history;
        } else {
          return resp.result;
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
          return resp.result.history;
        } else {
          return resp.result;
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
        return resp.result
          .filter(item => {
            return DateHelper.getDifference(item.copnUseDt, this.fromDt) >= 0;
          });
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
        return resp.result
          .filter(item => {
            return DateHelper.getDifference(item.copnOpDt, this.fromDt) >= 0;
          });
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
}

export default MytDataSubmainController;

