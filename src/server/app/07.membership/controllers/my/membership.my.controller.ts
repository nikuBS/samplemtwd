/**
 * FileName: membership.my.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MEMBERSHIP_GROUP, MEMBERSHIP_TYPE } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
import { Observable } from 'rxjs/Observable';

export default class MembershipMy extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.getMyInfoData(),
      this.getMembershipData()
    ).subscribe(([myInfoData, membershipData]) => {

      const error = {
        code: myInfoData.code || membershipData.code,
        msg: myInfoData.msg || membershipData.msg
      };

      if ( error.code ) {
        return this.error.render(res, { ...error, svcInfo, pageInfo });
      }

      res.render('my/membership.my.html', {
        myInfoData: myInfoData,
        membershipData: membershipData,
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    });
  }

  private getMyInfoData(): Observable<any> {
    let myInfoData = null;
    return this.apiService.request(API_CMD.BFF_11_0002, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      } else {
        myInfoData = this.parseMyInfoData(resp.result);
      }
      return resp.result;
    });
  }

  private getMembershipData(): Observable<any> {
    let membershipData = null;
    return this.apiService.request(API_CMD.BFF_11_0001, {}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      } else {
        membershipData = this.parseMembershipData(resp.result);
      }
      return resp.result;
    });
  }

  private parseMembershipData(membershipData): any {
    membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    return membershipData;
  }

  private parseMyInfoData(myInfoData): any {
    myInfoData.showPayAmtScor = FormatHelper.addComma((+myInfoData.payAmtScor).toString());
    myInfoData.mbrGrStr = MEMBERSHIP_GROUP[myInfoData.mbrGrCd];
    myInfoData.mbrTypStr = MEMBERSHIP_TYPE[myInfoData.mbrTypCd];
    myInfoData.todayDate = DateHelper.getCurrentShortDate();

    return myInfoData;
  }

}