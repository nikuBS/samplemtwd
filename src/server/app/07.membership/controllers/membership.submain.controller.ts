/**
 * FileName: membership.submain.controller.ts
 * Author: Eunjung Jung
 * Date: 2018.12.19
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';
import { MEMBERSHIP_GROUP , MEMBERSHIP_TYPE } from '../../../types/bff.type';

export default class MembershipSubmain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (this.isLogin(svcInfo)) {
      Observable.combineLatest(
        this.getMembershipData(),
        this.getPopBrandData()
      ).subscribe(([membershipData, popBrandData]) => {

        const error = {
          code: membershipData.code || popBrandData.code,
          msg: membershipData.msg || popBrandData.msg
        };

        if ( error.code ) {
          return this.error.render(res, { ...error, svcInfo });
        }

        res.render('membership.submain.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipData, popBrandData });
      });
    } else {
      Observable.combineLatest(
        this.getPopBrandData()
      ).subscribe(([popBrandData]) => {

        const error = {
          code: popBrandData.code,
          msg: popBrandData.msg
        };

        if ( error.code ) {
          return this.error.render(res, { ...error, svcInfo });
        }

        const membershipData = null;

        res.render('membership.submain.html', { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipData, popBrandData });
      });
    }
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
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
    membershipData.showCardNum = FormatHelper.addCardDash(membershipData.mbrCardNum.toString());
    membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    membershipData.mbrGrStr = MEMBERSHIP_GROUP[membershipData.mbrGrCd].toUpperCase();
    membershipData.mbrTypStr = MEMBERSHIP_TYPE[membershipData.mbrTypCd];
    return membershipData;
  }
/*
  private getNearBrandData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0025, {'bnnrExpsAreaCd' : '_banner_2007_F', 'svcDvcClCd' : 'M'}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }*/

  private getPopBrandData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0017, {'ordCol' : 'L', 'cateCd' : '00', 'pageNo' : '1', 'pageSize' : '10'}).map((resp) => {
      if ( resp.code !== API_CODE.CODE_00 ) {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }

      return resp.result;
    });
  }

}
