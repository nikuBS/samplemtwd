/**
 * @file membership.my.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.12.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MEMBERSHIP_GROUP, MEMBERSHIP_TYPE } from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
import moment from 'moment';
import { Observable } from 'rxjs/Observable';

export default class MembershipMy extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // 예상등급 조회 가능 날짜 확인
    const isExpectRating = this.getIsExpectRating();

    Observable.combineLatest(
      this.getMyInfoData(),
      this.getMembershipData()
    ).subscribe(([myInfoData, membershipData]) => {

      const error = {
        code: myInfoData.code || membershipData.code,
        msg: myInfoData.msg || membershipData.msg
      };

      if ( error.code ) {
        return this.error.render(res, { ...error, pageInfo, svcInfo });
      }

      res.render('my/membership.my.html', {
        myInfoData: myInfoData,
        membershipData: membershipData,
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        isExpectRating
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
    myInfoData.showEstimateGradeStart = DateHelper.getShortDateWithFormat(myInfoData.estimateGradeStart, 'YYYY. M.', 'YYYYMM');
    myInfoData.showEstimateGradeEnd = DateHelper.getShortDateWithFormat(myInfoData.estimateGradeEnd, 'YYYY. M.', 'YYYYMM');

    // 멤버십 종류가 Leaders Club 또는 SK Family 인 경우 재발급 신청 Hide
    if ( myInfoData.mbrTypStr === 'Leaders Club' || myInfoData.mbrTypStr === 'SK Family' ) {
      myInfoData.cardChangeShown = false;
    } else {
      myInfoData.cardChangeShown = true;
    }

    return myInfoData;
  }

  // 예상등급 조회 가능 날짜 확인
  private getIsExpectRating(): any {
    const curTime = moment();
    const startTime = moment('2020-12-17 10:00:00.000');
    const endTime = moment('2020-12-31 24:00:00.000');
    let isExpectRating = false;

    if (DateHelper.isBetween(curTime, startTime, endTime)) {
      isExpectRating = true;
    }

    // if (curTime > startTime && curTime < endTime) {
    //   isExpectRating = true;
    // }
    return isExpectRating;
  }

}
