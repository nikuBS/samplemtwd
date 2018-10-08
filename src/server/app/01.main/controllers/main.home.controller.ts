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

class MainHome extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any) {
    const svcType = this.getSvcType(svcInfo);
    const homeData = {
      usageData: null,
      membershipData: null,
      billData: null,
      ppsInfo: null
    };
    let smartCard = [];

    if ( svcType.login ) {
      svcInfo = this.parseSvcInfo(svcType, svcInfo);
      if ( svcType.mobile ) {
        smartCard = this.getSmartCardOrder(svcInfo.svcMgmtNum);
        Observable.combineLatest(
          this.getUsageData(),
          this.getMembershipData()
        ).subscribe(([usageData, membershipData]) => {
          homeData.usageData = usageData;
          homeData.membershipData = membershipData;
          res.render('main.home.html', { svcInfo, svcType, homeData, smartCard });
        });
      } else if ( svcType.svcCategory === LINE_NAME.INTERNET_PHONE_IPTV ) {
        Observable.combineLatest(
          this.getBillData(),
          this.getWireServiceInfo()
        ).subscribe(([billData, wireService]) => {
          homeData.billData = billData;
          res.render('main.home.html', { svcInfo, svcType, homeData, smartCard });
        });
      } else {
        if ( svcInfo.svcAttrCd === SVC_ATTR_E.PPS ) {
          Observable.combineLatest(
            this.getUsageData(),
            this.getPPSInfo()
          ).subscribe(([usageData, ppsInfo]) => {
            homeData.usageData = usageData;
            homeData.ppsInfo = ppsInfo;
            res.render('main.home.html', { svcInfo, svcType, homeData, smartCard });
          });
        } else {
          this.getUsageData().subscribe((resp) => {
            homeData.usageData = resp;
            res.render('main.home.html', { svcInfo, svcType, homeData, smartCard });
          });
        }
      }
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

  private getMembershipData(): Observable<any> {
    let membershipData = {};
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
    let billData = {};
    return Observable.combineLatest(
      this.getCharge(),
      this.getUsed(),
      (charge, used) => {
        return { charge, used };
      }).map((resp) => {
      billData = this.parseBillData(resp);
      console.log(billData);
      return billData;
    });
  }

  private getCharge(): any {
    return this.apiService.request(API_CMD.BFF_05_0036, { invDt: ['201810'] }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  private getUsed(): any {
    return this.apiService.request(API_CMD.BFF_05_0047, { invDt: ['201810'] }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      }
      return null;
    });
  }

  private parseBillData(billData): any {
    if ( billData.charge.coClCd === MYT_FARE_BILL_CO_TYPE.BROADBAND ) {
      return {
        coClCd: billData.charge.coClCd,
        chargeAmtTot: billData.charge.useAmtTot,
        usedAmtTot: billData.used.useAmtTot,
        deduckTot: billData.charge.deduckTotInvAmt,
        invEndDt: DateHelper.getShortDateNoDot(billData.charge.invDt + '000000'),
        invStartDt: DateHelper.getShortFirstDateNoNot(billData.charge.invDt + '000000')
      };
    }
    return {};
  }

  private getWireServiceInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0139, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {

      }

      return resp.result;
    });
  }

  private getPPSInfo(): Observable<any> {
    const ppsInfo = {
      numEndDt: ''
    };
    return this.apiService.request(API_CMD.BFF_05_0013, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        ppsInfo.numEndDt = DateHelper.getShortDateNoDot(resp.result.numEndDt + '000000');
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
