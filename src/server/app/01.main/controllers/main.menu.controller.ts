/**
 * FileName: main.menu.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.04
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { MEMBERSHIP_GROUP, UNIT, UNIT_E } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';

class MainMenu extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const menuData = {
      usageData: null,
      billData: null,
      membershipData: null
    };

    if ( FormatHelper.isEmpty(svcInfo) ) {
      res.render('main.menu.html', { svcInfo, menuData, pageInfo });
    } else {
      Observable.combineLatest(
        this.getUsageData(),
        this.getBillData(),
        this.getMembershipData()
      ).subscribe(([usageData, billData, membershipData]) => {
        menuData.usageData = usageData;
        menuData.billData = billData;
        menuData.membershipData = membershipData;
        res.render('main.menu.html', { svcInfo, menuData, pageInfo });
      });
    }
  }

  private getUsageData(): Observable<any> {
    const usageData = {};
    return this.apiService.request(API_CMD.BFF_05_0001, {}).map((resp) => {
      // if ( resp.code === API_CODE.CODE_00 ) {
      //   usageData = this.parseUsageData(resp.result);
      // }
      return usageData;
    });
  }

  private parseUsageData(usageData): any {
    const kinds = ['data', 'voice'];
    const result = {
      data: {},
      voice: {}
    };

    kinds.map((kind, index) => {
      if ( !FormatHelper.isEmpty(usageData[kind][0]) ) {
        result[kind] = usageData[kind][0];
        this.convShowData(result[kind]);
      }
    });
    return result;
  }

  private convShowData(data: any) {
    data.isUnlimit = !isFinite(data.total);
    if ( !data.isUnlimit ) {
      data.showRemained = this.convFormat(data.remained, data.unit);
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

  private getBillData(): Observable<any> {
    let billData = '';
    return this.apiService.request(API_CMD.BFF_05_0036, { invDt: ['201810'] }).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        billData = this.parseBillData(resp.result);
      }
      return billData;
    });
  }

  private parseBillData(billData): any {
    const useAmtTot = billData.useAmtTot ? parseInt(billData.useAmtTot, 10) : 0;
    const deduckTotInvAmt = billData.deduckTotInvAmt ? parseInt(billData.deduckTotInvAmt, 10) : 0;
    return (useAmtTot + deduckTotInvAmt).toString();
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
    membershipData.showGroup = MEMBERSHIP_GROUP[membershipData.mbrGrCd];
    return membershipData;
  }
}

export default MainMenu;
