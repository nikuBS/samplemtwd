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
        this.getMembershipCheck(),
        this.getMembershipData(),
        this.getPopBrandData()
      ).subscribe(([membershipCheckData, membershipData, popBrandData]) => {
        const error = {
          code: membershipData.code || popBrandData.code,
          msg: membershipData.msg || popBrandData.msg
        };

        if ( error.code ) {
          return this.error.render(res, { ...error, svcInfo });
        }

        this.logger.info(this, 'membershipCheckData1 : ', membershipCheckData);

        res.render('membership.submain.html',
            { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipCheckData, membershipData, popBrandData });
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
        const membershipCheckData = null;

        this.logger.info(this, 'membershipCheckData2 : ', membershipCheckData);

        res.render('membership.submain.html',
            { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipCheckData, membershipData, popBrandData });
      });
    }
  }

  private isLogin(svcInfo: any): boolean {
    if (FormatHelper.isEmpty(svcInfo)) {
      return false;
    }
    return true;
  }

  private getMembershipCheck(): Observable<any> {
    let membershipCheckData = null;
    return this.apiService.request(API_CMD.BFF_11_0015, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        membershipCheckData = resp.result;
      }
      return membershipCheckData;
    });
  }

  private getMembershipData(): Observable<any> {
    let membershipData = null;
    return this.apiService.request(API_CMD.BFF_11_0001, {}).map((resp) => {
      if ( resp.code === 'MBR0001' || resp.code === 'MBR0002' || resp.code === 'MBR0008' ) {
        resp.code = null;
        membershipData = resp;
        return membershipData;
      } else if ( resp.code === API_CODE.CODE_00 ) {
        membershipData = this.parseMembershipData(resp.result);
        return membershipData;
      } else {
        return {
          code: resp.code,
          msg: resp.msg
        };
      }
    });
  }

  private parseMembershipData(membershipData): any {
    membershipData.showCardNumDash = FormatHelper.addCardDash(membershipData.mbrCardNum.toString());
    membershipData.showCardNum = FormatHelper.addCardSpace(membershipData.mbrCardNum);
    membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    membershipData.mbrGrStr = MEMBERSHIP_GROUP[membershipData.mbrGrCd].toUpperCase();
    membershipData.mbrGrade = MEMBERSHIP_GROUP[membershipData.mbrGrCd].toLowerCase();
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
