/**
 * FileName: main.home.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.06
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {
  HOME_SEGMENT,
  HOME_SEGMENT_ORDER,
  HOME_SMART_CARD,
  LINE_NAME,
  SVC_ATTR_E,
  SVC_ATTR_NAME,
  UNIT,
  UNIT_E,
  MYT_FARE_BILL_CO_TYPE
} from '../../../types/bff.type';
import DateHelper from '../../../utils/date.helper';
import { REDIS_APP_VERSION } from '../../../types/common.type';

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
      ppsInfo: null,
      joinInfo: null
    };
    let smartCard = [];

    if ( svcType.login ) {
      svcInfo = this.parseSvcInfo(svcType, svcInfo);
      if ( svcType.mobile ) {
        smartCard = this.getSmartCardOrder(svcInfo.svcMgmtNum);
        Observable.combineLatest(
          this.getUsageData(),
          this.getMembershipData(),
          this.getNotice()
        ).subscribe(([usageData, membershipData, notice]) => {
          homeData.usageData = usageData;
          homeData.membershipData = membershipData;
          res.render('main.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
        });
      } else if ( svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ) {
        Observable.combineLatest(
          this.getBillData(),
          this.getJoinInfo(),
          this.getNotice()
        ).subscribe(([billData, joinInfo, notice]) => {
          homeData.billData = billData;
          homeData.joinInfo = joinInfo;
          res.render('main.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
        });
      } else {
        if ( svcInfo.svcAttrCd === SVC_ATTR_E.PPS ) {
          Observable.combineLatest(
            this.getUsageData(),
            this.getPPSInfo(),
            this.getNotice()
          ).subscribe(([usageData, ppsInfo, notice]) => {
            homeData.usageData = usageData;
            homeData.ppsInfo = ppsInfo;
            res.render('main.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
          });
        } else {
          Observable.combineLatest(
            this.getUsageData(),
            this.getNotice()
          ).subscribe(([usageData, notice]) => {
            homeData.usageData = usageData;
            res.render('main.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
          });
        }
      }
    } else {
      this.getNotice().subscribe((notice) => {
        res.render('main.home.html', { svcInfo, svcType, homeData, smartCard, notice, pageInfo });
      });
    }
  }

  private getSmartCardOrder(svcMgmtNum): any {
    const orderNum = +svcMgmtNum % 6;
    const order = HOME_SEGMENT_ORDER[HOME_SEGMENT[orderNum]];
    return order.map((segment) => {
      return {
        no: segment,
        title: HOME_SMART_CARD[segment]
      };
    });
  }

  private getSvcType(svcInfo): any {
    const svcType = {
      svcCategory: LINE_NAME.MOBILE,
      mobile: false,
      login: false
    };

    if ( !FormatHelper.isEmpty(svcInfo) ) {
      svcType.login = true;
      if ( svcInfo.svcAttrCd === SVC_ATTR_E.MOBILE_PHONE ) {
        svcType.mobile = true;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.INTERNET || svcInfo.svcAttrCd === SVC_ATTR_E.IPTV || svcInfo.svcAttrCd === SVC_ATTR_E.TELEPHONE ) {
        svcType.svcCategory = LINE_NAME.INTERNET_PHONE_IPTV;
      } else if ( svcInfo.svcAttrCd === SVC_ATTR_E.POINT_CAM ) {
        svcType.svcCategory = LINE_NAME.SECURITY;
      }
    }

    return svcType;
  }

  private getNotice(): Observable<any> {
    return this.redisService.getData(REDIS_APP_VERSION)
      .map((result) => {
        if ( !FormatHelper.isEmpty((result)) ) {
          return result.notice;
        }
        return null;
      });
  }

  private getMembershipData(): Observable<any> {
    let membershipData = null;
    return this.apiService.request(API_CMD.BFF_04_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        membershipData = this.parseMembershipData(resp.result);
      }
      return membershipData;
    });
  }

  private parseMembershipData(membershipData): any {
    membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    return membershipData;
  }

  private getBillData(): Observable<any> {
    let billData = null;
    return Observable.combineLatest(
      this.getCharge(),
      this.getUsed(),
      (charge, used) => {
        return { charge, used };
      }).map((resp) => {
      billData = this.parseBillData(resp);
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
    if ( !FormatHelper.isEmpty(billData.charge) && !FormatHelper.isEmpty(billData.used) &&
      billData.charge.coClCd !== MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
      const repSvc = billData.charge.repSvcYn === 'Y';
      const totSvc = billData.charge.paidAmtMonthSvcCnt > 1;
      return {
        chargeAmtTot: FormatHelper.addComma(billData.charge.useAmtTot),
        usedAmtTot: FormatHelper.addComma(billData.used.useAmtTot),
        deduckTot: FormatHelper.addComma(billData.charge.deduckTotInvAmt),
        repSvc: billData.charge.repSvcYn === 'Y',
        totSvc: billData.charge.paidAmtMonthSvcCnt > 1,
        invEndDt: DateHelper.getShortDateNoDot(billData.charge.invDt),
        invStartDt: DateHelper.getShortFirstDateNoNot(billData.charge.invDt),
        invMonth: DateHelper.getCurrentMonth(billData.charge.invDt),
        type1: totSvc && repSvc,
        type2: !totSvc,
        type3: totSvc && !repSvc
      };
    }
    return null;
  }

  private getJoinInfo(): Observable<any> {
    let joinInfo = null;
    return this.apiService.request(API_CMD.BFF_05_0068, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        joinInfo = this.parseJoinInfo(resp.result);
      }
      return joinInfo;
    });
  }

  private parseJoinInfo(joinInfo): any {
    return {
      showSet: !(FormatHelper.isEmpty(joinInfo.setPrdStaDt) && FormatHelper.isEmpty(joinInfo.setPrdEndDt)),
      showSvc: !(FormatHelper.isEmpty(joinInfo.svcPrdStaDt) && FormatHelper.isEmpty(joinInfo.svcPrdEndDt)),
      setPrdStaDt: DateHelper.getShortDateNoDot(joinInfo.setPrdStaDt),
      setPrdEndDt: DateHelper.getShortDateNoDot(joinInfo.setPrdEndDt),
      svcPrdStaDt: DateHelper.getShortDateNoDot(joinInfo.svcPrdStaDt),
      svcPrdEndDt: DateHelper.getShortDateNoDot(joinInfo.svcPrdEndDt)
    };
  }

  private getPPSInfo(): Observable<any> {
    const ppsInfo = {
      numEndDt: ''
    };
    return this.apiService.request(API_CMD.BFF_05_0013, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        ppsInfo.numEndDt = DateHelper.getShortDateNoDot(resp.result.numEndDt);
      }
      return ppsInfo;
    });
  }

  private parseSvcInfo(svcType, svcInfo): any {
    svcInfo.showName = FormatHelper.isEmpty(svcInfo.nickNm) ? SVC_ATTR_NAME[svcInfo.svcAttrCd] : svcInfo.nickNm;
    svcInfo.showSvc = svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ? svcInfo.addr : svcInfo.svcNum;
    return svcInfo;
  }

  // 사용량 조회
  private getUsageData(): Observable<any> {
    let usageData = {
      code: null
    };
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        usageData = this.parseUsageData(resp.result);
      }
      usageData.code = resp.code;
      return usageData;
    });
  }


  private parseUsageData(usageData: any): any {
    const kinds = ['data', 'voice', 'sms'];
    const result = {
      data: {},
      voice: {},
      sms: {},
      first: ''
    };

    kinds.map((kind, index) => {
      if ( !FormatHelper.isEmpty(usageData[kind][0]) ) {
        if ( FormatHelper.isEmpty(result.first) ) {
          result.first = kind;
        }
        result[kind] = usageData[kind][0];
        this.convShowData(result[kind]);
      }
    });
    return result;
  }

  private convShowData(data: any) {
    data.isUnlimit = !isFinite(data.total);
    data.remainedRatio = 100;
    data.showUsed = this.convFormat(data.used, data.unit);
    if ( !data.isUnlimit ) {
      data.showTotal = this.convFormat(data.total, data.unit);
      data.showRemained = this.convFormat(data.remained, data.unit);
      data.remainedRatio = data.remained / data.total * 100;
    }
  }

  private convFormat(data: string, unit: string): string {
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
}

export default MainHome;
