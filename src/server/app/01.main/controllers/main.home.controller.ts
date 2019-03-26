/**
 * FileName: main.home.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {
  HOME_SMART_CARD,
  LINE_NAME,
  LOGIN_TYPE,
  MEMBERSHIP_GROUP,
  MYT_FARE_BILL_CO_TYPE,
  SVC_ATTR_E,
  TPLAN_PROD_ID,
  TPLAN_SHARE_LIST,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../types/bff.type';
import { SKIP_NAME, TIME_UNIT, UNIT as UNIT_STR, UNLIMIT_NAME } from '../../../types/string.type';
import DateHelper from '../../../utils/date.helper';
import { CHANNEL_CODE, REDIS_KEY, REDIS_TOS_KEY } from '../../../types/redis.type';
import BrowserHelper from '../../../utils/browser.helper';

class MainHome extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const svcType = this.getSvcType(svcInfo);
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null,
    };

    const noticeCode = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;

    const flag = BrowserHelper.isApp(req) ? 'app' : 'web';


    if ( svcType.login ) {
      if ( svcType.svcCategory === LINE_NAME.MOBILE ) {
        if ( svcType.mobilePhone ) {
          // 모바일 - 휴대폰 회선
          Observable.combineLatest(
            this.getUsageData(svcInfo),
            this.getMembershipData(svcInfo),
            this.getRedisData(noticeCode, svcInfo.svcMgmtNum)
          ).subscribe(([usageData, membershipData, redisData]) => {
            homeData.usageData = usageData;
            homeData.membershipData = membershipData;
            const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType };
            res.render(`main.home-${flag}.html`, renderData);
          });
        } else {
          // 모바일 - 휴대폰 외 회선
          Observable.combineLatest(
            this.getUsageData(svcInfo),
            this.getRedisData(noticeCode, svcInfo.svcMgmtNum)
          ).subscribe(([usageData, redisData]) => {
            homeData.usageData = usageData;
            const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType };
            res.render(`main.home-${flag}.html`, renderData);
          });
        }
      } else if ( svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ) {
        // 인터넷 회선
        Observable.combineLatest(
          this.getBillData(svcInfo),
          this.getRedisData(noticeCode, svcInfo.svcMgmtNum)
        ).subscribe(([billData, redisData]) => {
          homeData.billData = billData;
          const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: svcInfo.noticeType };
          res.render(`main.home-${flag}.html`, renderData);
        });
      }
    } else {
      // 비로그인
      this.getRedisData(noticeCode, '').subscribe((redisData) => {
        const renderData = { svcInfo, svcType, homeData, redisData, pageInfo, noticeType: '' };
        res.render(`main.home-${flag}.html`, renderData);
      });
    }
  }

  private getSmartCardOrder(svcMgmtNum): Observable<any> {
    if ( FormatHelper.isEmpty(svcMgmtNum) ) {
      return Observable.of([]);
    }
    return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD + svcMgmtNum)  // 1004483007
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          return Observable.of(resp);
        } else {
          return this.redisService.getStringTos(REDIS_TOS_KEY.SMART_CARD_DEFAULT);
        }
      }).map((resp) => {
        this.logger.info(this, '[Smart Card]', resp);
        // let order = ['00001', '00002', '00003', '00004', '00005'];
        let order = [];
        if ( resp.code === API_CODE.CODE_00 ) {
          order = resp.result.split(',');
        }
        return order.map((segment) => {
          return {
            no: segment,
            title: HOME_SMART_CARD[segment]
          };
        });
      });
  }

  private getSvcType(svcInfo): any {
    const svcType = {
      svcCategory: LINE_NAME.MOBILE,
      mobilePhone: false,
      login: false
    };

    if ( !FormatHelper.isEmpty(svcInfo) ) {
      svcType.login = true;
      if ( svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
        svcType.mobilePhone = true;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.INTERNET || svcInfo.svcAttrCd === SVC_ATTR_E.IPTV || svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE ) {
        svcType.svcCategory = LINE_NAME.INTERNET_PHONE_IPTV;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.POINT_CAM ) {
        svcType.svcCategory = LINE_NAME.SECURITY;
      }
    }

    return svcType;
  }

  private getRedisData(noticeCode, svcMgmtNum): Observable<any> {
    return Observable.combineLatest(
      this.getNoti(),
      this.getHomeNotice(noticeCode),
      this.getHomeHelp(),
      this.getSmartCardOrder(svcMgmtNum)
    ).map(([noti, notice, help, smartCard]) => {
      let mainNotice = null;
      let emrNotice = null;
      if ( !FormatHelper.isEmpty(notice) ) {
        mainNotice = notice.mainNotice;
        emrNotice = notice.emrNotice;
      }
      return { noti, mainNotice, emrNotice, help, smartCard };
    });
  }

  private getNoti(): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTI)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //
        // }
        return resp.result;
      });
  }

  private getHomeNotice(noticeCode): Observable<any> {
    return this.redisService.getData(REDIS_KEY.HOME_NOTICE + noticeCode)
      .map((resp) => {
        // if ( resp.code === API_CODE.REDIS_SUCCESS ) {
        //   return resp.result;
        // }
        return resp.result;
      });
  }

  private getHomeHelp(): Observable<any> {
    let result = null;
    return this.redisService.getData(REDIS_KEY.HOME_HELP)
      .map((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          result = this.parseHelpData(resp.result.cicntsList);
        }
        return result;
      });
  }

  private parseHelpData(cicntsList): any {
    const resultArr = <any>[];
    for ( let i = 0; i < cicntsList.length; i += 3 ) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

  private getMembershipData(svcInfo): Observable<any> {
    let membershipData = {
      code: ''
    };
    if ( svcInfo.loginType === LOGIN_TYPE.EASY ) {
      membershipData.code = 'EASY_LOGIN';
      return Observable.of(membershipData);
    } else {
      return this.apiService.requestStore(SESSION_CMD.BFF_04_0001, {}).map((resp) => {
        membershipData.code = resp.code;
        if ( resp.code === API_CODE.CODE_00 ) {
          membershipData = Object.assign(membershipData, this.parseMembershipData(resp.result));
        }
        return membershipData;
      });
    }
  }

  private parseMembershipData(membershipData): any {
    // membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    membershipData.mbrGrStr = MEMBERSHIP_GROUP[membershipData.mbrGrCd];
    membershipData.showCardNum = FormatHelper.addCardSpace(membershipData.mbrCardNum);
    return membershipData;
  }

  private getBillData(svcInfo): Observable<any> {
    let billData = {
      showBill: false,
      showSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)
    };

    return Observable.combineLatest(
      this.getCharge(),
      this.getUsed(),
      (charge, used) => {
        return { charge, used };
      }).map((resp) => {
      billData = Object.assign(billData, this.parseBillData(resp));
      return billData;
    });
  }

  private getCharge(): any {
    return this.apiService.request(API_CMD.BFF_05_0036, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  private getUsed(): any {
    return this.apiService.request(API_CMD.BFF_05_0047, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  private parseBillData(billData): any {
    if ( !FormatHelper.isEmpty(billData.charge) && !FormatHelper.isEmpty(billData.used) ) {
      if ( billData.charge.coClCd === MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
        return {
          showBill: true,
          isBroadband: true
        };
      }

      const repSvc = billData.charge.repSvcYn === 'Y';
      const totSvc = +billData.charge.paidAmtMonthSvcCnt;
      const billName = repSvc ? 'charge' : 'used';

      return {
        showBill: true,
        isBroadband: false,
        type1: repSvc,
        type2: totSvc === 1,
        type3: !repSvc && totSvc !== 1,
        useAmtTot: FormatHelper.addComma(billData[billName].useAmtTot || '0'),
        deduckTot: FormatHelper.addComma(billData[billName].deduckTotInvAmt || '0'),
        invEndDt: DateHelper.getShortDate(billData[billName].invDt),
        invStartDt: DateHelper.getShortFirstDate(billData[billName].invDt),
        invMonth: DateHelper.getCurrentMonth(billData[billName].invDt),
        billMonth: +DateHelper.getCurrentMonth(billData[billName].invDt) + 1,
      };
    }
    return null;
  }

  // 사용량 조회
  private getUsageData(svcInfo): Observable<any> {
    let usageData = {
      code: '',
      msg: '',
      showSvcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum)
    };
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = Object.assign(usageData, this.parseUsageData(resp.result, svcInfo));
      } else if ( resp.code === API_CODE.BFF_0006 || resp.code === API_CODE.BFF_0007 ) {
        usageData['fromDate'] = DateHelper.getShortDateAnd24Time(resp.result.fromDtm);
        usageData['toDate'] = DateHelper.getShortDateAnd24Time(resp.result.toDtm);
      }
      usageData.code = resp.code;
      usageData.msg = resp.msg;

      return usageData;
    });
  }


  private parseUsageData(usageData: any, svcInfo: any): any {
    const etcKinds = ['voice', 'sms'];
    const result = {
      data: { isShow: false },
      voice: { isShow: false },
      sms: { isShow: false }
    };

    if ( !FormatHelper.isEmpty(usageData.gnrlData) ) {
      this.mergeData(usageData.gnrlData, result.data);
      result.data['isTplanProd'] = TPLAN_PROD_ID.indexOf(svcInfo.prodId) !== -1;
    }

    etcKinds.map((kind, index) => {
      if ( !FormatHelper.isEmpty(usageData[kind][0]) ) {
        result[kind] = usageData[kind][0];
        this.convShowData(result[kind]);
      }
    });
    return result;
  }

  private mergeData(list: any, data: any) {
    data.isShow = true;
    data.isUnlimit = false;
    data.isTplanUse = false;
    data.shareTotal = 0;
    data.shareRemained = 0;
    data.myRemainedRatio = 100;
    data.shareRemainedRatio = 100;

    list.map((target) => {
      if ( UNLIMIT_CODE.indexOf(target.unlimit) !== -1 ) {
        data.isUnlimit = true;
        data.showMyRemained = SKIP_NAME.UNLIMIT;
        data.showAddRemained = SKIP_NAME.UNLIMIT;
      }
      if ( TPLAN_SHARE_LIST.indexOf(target.skipId) !== -1 ) {
        data.shareTotal += +target.total;
        data.shareRemained += +target.remained;
        data.isTplanUse = true;
      }
    });
    data.showShareRemained = this.convFormat(data.shareRemained, UNIT_E.DATA);
    if ( !data.isUnlimit ) {
      data.myTotal = 0;
      data.myRemained = 0;
      list.map((target) => {
        if ( TPLAN_SHARE_LIST.indexOf(target.skipId) === -1 ) {
          data.myTotal += +target.total;
          data.myRemained += +target.remained;
        }
      });

      data.addRemained = data.myRemained + data.shareRemained;
      data.addTotal = data.myTotal + data.shareTotal;
      data.showAddRemained = this.convFormat(data.addRemained, UNIT_E.DATA);

      data.showMyRemained = this.convFormat(data.myRemained, UNIT_E.DATA);
      data.myRemainedRatio = Math.round(data.myRemained / data.addTotal * 100);
      data.shareRemainedRatio = Math.round(data.addRemained / data.addTotal * 100);
    }
  }

  private convShowData(data: any) {
    data.isShow = true;
    data.isUnlimit = UNLIMIT_CODE.indexOf(data.unlimit) !== -1;
    data.remainedRatio = 100;
    // data.showUsed = this.convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      // data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.showRemainedText = data.showRemained + ' ' + UNLIMIT_NAME.REMAIN;
      data.remainedRatio = Math.round(data.remained / data.total * 100);
    } else {
      data.showRemained = UNLIMIT_NAME[data.unlimit];
      data.showRemainedText = data.showRemained;
    }
  }

  private convFormat(data: string, unit: string): any {
    switch ( unit ) {
      case UNIT_E.DATA:
        const resultData = FormatHelper.convDataFormat(data, UNIT[unit]);
        return resultData.data + resultData.unit;
      case UNIT_E.VOICE:
        const resultVoice = FormatHelper.convVoiceFormat(data);
        let resp = '';
        if ( resultVoice.hours !== 0 ) {
          resp += resultVoice.hours + TIME_UNIT.HOURS;
        }
        if ( resultVoice.min !== 0 ) {
          if ( !FormatHelper.isEmpty(resp) ) {
            resp += ' ';
          }
          resp += resultVoice.min + TIME_UNIT.MINUTE;
        }
        if ( FormatHelper.isEmpty(resp) ) {
          resp = '0' + TIME_UNIT.MINUTE;
        }
        return resp;
      case UNIT_E.SMS:
      case UNIT_E.SMS_2:
        return FormatHelper.addComma(data) + UNIT_STR.SMS;
      default:
    }
    return '';
  }
}

export default MainHome;
