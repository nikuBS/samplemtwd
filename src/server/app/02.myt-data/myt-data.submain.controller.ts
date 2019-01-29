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
import { CURRENCY_UNIT, DATA_UNIT, ETC_CENTER, MYT_DATA_CHARGE_TYPE_NAMES, MYT_T_DATA_GIFT_TYPE } from '../../types/string.type';
import BrowserHelper from '../../utils/browser.helper';
import { LOGIN_TYPE, PREPAID_PAYMENT_PAY_CD, PREPAID_PAYMENT_TYPE, UNIT, UNIT_E } from '../../types/bff.type';
import StringHelper from '../../utils/string.helper';

const skipIdList: any = ['POT10', 'POT20', 'DDZ25', 'DDZ23', 'DD0PB', 'DD3CX', 'DD3CU', 'DD4D5', 'LT'];
const tmoaBelongToProdList: any = ['NA00005959', 'NA00005958', 'NA00005957', 'NA00005956', 'NA00005955', 'NA00006157', 'NA00006156',
  'NA00006155', 'NA00005627', 'NA00005628', 'NA00005629', 'NA00004891'];

class MytDataSubmainController extends TwViewController {
  constructor() {
    super();
  }

  private fromDt = DateHelper.getPastYearShortDate();
  private toDt = DateHelper.getCurrentShortDate();
  private isPPS = false;

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
    this.isPPS = (svcInfo.svcAttrCd === 'M2');
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
        if ( data.remnantData.tmoa && data.remnantData.tmoa.length > 0 ) {
          // 가입
          data.family = data.remnantData.tmoa[0];
          data.family.remained = data.family.showRemained.data + data.family.showRemained.unit;
          // T가족모아 가입가능한 요금제
          data.family.isProdId = tmoaBelongToProdList.indexOf(data.svcInfo.prodId) > -1;
        } else {
          // 미가입
          data.family = {
            impossible: true
          };
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
        // 선불쿠폰영역 휴대폰 인 경우에만 노출 (9차) - 11차에서 hidden 처리(190121)
        // TODO: BPCP 완료 후 enable 처리
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
      const breakdownList: any = [];
      if ( dcBkd && dcBkd.length > 0 ) {
        // 데이터한도요금제 충전내역
        dcBkd.map((item) => {
          if ( this.isPPS ) {
            item['opDt'] = item.chargeDt;
            item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
            item['u_type'] = 'data';
            item['u_title'] = PREPAID_PAYMENT_PAY_CD[item.payCd];
            item['u_sub'] = item.wayCd === '02' ? item.cardNm : PREPAID_PAYMENT_TYPE[item.wayCd];
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = item.data;
            item['unit'] = CURRENCY_UNIT.WON;
          } else {
            item['class'] = (item.opTypCd === '2' || item.opTypCd === '4') ? 'send' : 'recharge';
            item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.LIMIT_CHARGE;
            item['u_sub'] = item.opOrgNm || ETC_CENTER;
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = DateHelper.getShortDate(item.opDt);
            item['unit'] = CURRENCY_UNIT.WON;
          }
        });
        breakdownList.push(dcBkd);
      }
      if ( dpBkd && dpBkd.length > 0 ) {
        // T끼리 선물하기 내역
        // type: 1 send, 2 recharge
        dpBkd.map((item) => {
          const dataQty = FormatHelper.convDataFormat(item.dataQty, 'MB');
          item['opDt'] = item.opDtm.slice(0, 8);
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.DATA_GIFT;
          // 충전/선물내역과 동일하게 처리
          item['u_sub'] = /*MYT_T_DATA_GIFT_TYPE[item.giftType] + ' | ' + */FormatHelper.conTelFormatWithDash(item.svcNum);
          item['d_title'] = dataQty.data;
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = dataQty.unit;
        });
        breakdownList.push(dpBkd);
      }
      if ( tpBkd && tpBkd.length > 0 ) {
        // 팅요금 선물하기 내역
        // opTypCd: 1 send, 2 recharge
        tpBkd.map((item) => {
          item['class'] = (item.opTypCd === '1' ? 'send' : 'recharge');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_GIFT;
          // custNm 명세서에서 제외됨
          item['u_sub'] = /*item.custNm ||  + ' | ' +*/ FormatHelper.conTelFormatWithDash(item.svcNum);
          item['d_title'] = FormatHelper.addComma(item.amt);
          item['d_sub'] = DateHelper.getShortDate(item.opDt);
          item['unit'] = CURRENCY_UNIT.WON;
        });
        breakdownList.push(tpBkd);
      }
      if ( etcBkd && etcBkd.length > 0 ) {
        // 팅/쿠키즈/안심요금 충전 내역
        etcBkd.map((item) => {
          if ( this.isPPS ) {
            item['opDt'] = item.chargeDt;
            item['class'] = (item.chargeTp === '1') ? 'once' : 'auto';
            item['u_type'] = 'voice';
            item['u_title'] = PREPAID_PAYMENT_PAY_CD[item.payCd];
            item['u_sub'] = item.wayCd === '02' ? item.cardNm : PREPAID_PAYMENT_TYPE[item.wayCd];
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = item.data;
            item['unit'] = CURRENCY_UNIT.WON;
          } else {
            item['class'] = (item.opTypCd === '2' || item.opTypCd === '4') ? 'send' : 'recharge';
            item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.TING_CHARGE;
            item['u_sub'] = item.opOrgNm || ETC_CENTER;
            item['d_title'] = FormatHelper.addComma(item.amt);
            item['d_sub'] = DateHelper.getShortDate(item.opDt);
            item['unit'] = CURRENCY_UNIT.WON;
          }
        });
        breakdownList.push(etcBkd);
      }
      if ( refpBkd && refpBkd.length > 0 ) {
        // 리필쿠폰 선물 내역
        refpBkd.map((item) => {
          item['opDt'] = item.copnOpDt;
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_GIFT;
          item['u_sub'] = FormatHelper.conTelFormatWithDash(item.svcNum);
          item['d_title'] = ''; // API response 값에 정의되어있지 않음
          item['d_sub'] = DateHelper.getShortDate(item.copnOpDt);
          item['unit'] = '';
        });
        breakdownList.push(refpBkd);
      }
      if ( refuBkd && refuBkd.length > 0 ) {
        // 리필쿠폰 사용이력조회
        refuBkd.map((item) => {
          item['opDt'] = item.copnUseDt;
          item['class'] = (item.type === '1' ? 'send' : 'recharge');
          item['u_title'] = MYT_DATA_CHARGE_TYPE_NAMES.REFILL_USAGE;
          item['u_sub'] = item.opOrgNm || ETC_CENTER;
          item['d_title'] = item.copnDtlClNm;
          item['d_sub'] = DateHelper.getShortDate(item.copnUseDt);
          item['unit'] = '';
        });
        breakdownList.push(refuBkd);
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

      if ( data.family && data.family.impossible ) {
        res.render('myt-data.submain.html', { data });
      } else {
        // 가입이 가능한 경우에만
        if ( data.family ) {
          this.apiService.request(API_CMD.BFF_06_0044, {}).subscribe((family) => {
            if ( family.code === API_CODE.CODE_00 ) {
              // T가족모아 서비스는 가입되어있지만 공유 불가능한 요금제이면서 미성년인 경우
              if ( data.family.isProdId || family.result.adultYn === 'N' ) {
                data.family.noshare = true;
              }
            } else if ( family.code === API_T_FAMILY_ERROR.BLN0010 ) {
              // T가족모아 가입 가능한 요금제이나 미가입으로 가입유도 화면 노출
              data.family.impossible = true;
            } else {
              // 가입불가능한 요금제인 경우
              data.family = null;
            }
            res.render('myt-data.submain.html', { data });
          });
        } else {
          res.render('myt-data.submain.html', { data });
        }
      }
    });
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
        nickNm: item.childEqpMdNm || item.eqpMdlNm, // item.mdlName 서버데이터 확인후 변경
        svcNum: StringHelper.phoneStringToDash(item.svcNum),
        svcMgmtNum: item.svcMgmtNum
      });
    });
    return list;
  }

  compare(a, b) {
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
          item.nickNm = item.eqpMdlNm || item.nickNm;
          item.svcNum = StringHelper.phoneStringToDash(item.svcNum);
          list.push(item);
        }
      });
    }
    return list;
  }

  sortBreakdownItems(items): any {
    return Array.prototype.concat.apply([], items).sort((a, b) => {
      if ( a.opDt > b.opDt ) {
        return -1;
      } else if ( a.opDt < b.opDt ) {
        return 1;
      }
      return 0;
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
}

export default MytDataSubmainController;

