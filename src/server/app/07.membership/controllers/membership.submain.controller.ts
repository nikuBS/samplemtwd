/**
 * MenuName: T멤버십 > submain (BE_01)
 * @file membership.submain.controller.ts
 * @author Eunjung Jung
 * @since 2018.12.19
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';
import moment from 'moment';
import { MEMBERSHIP_GROUP , MEMBERSHIP_TYPE } from '../../../types/bff.type';
import DateHelper from '../../../utils/date.helper';

export default class MembershipSubmain extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (this.isLogin(svcInfo)) {
      // 예상등급 조회 가능 날짜 확인
      const isExpectRating = this.getIsExpectRating();

      // 멤버십 등급 준회원, 선불폰, 유선서비스 가입자 인 경우
      if (svcInfo.svcGr === 'P' || svcInfo.svcGr === 'I' || svcInfo.svcGr === 'T' || svcInfo.svcGr === 'U'
          || svcInfo.svcGr === '') {
        Observable.combineLatest(
            this.getPopBrandData()
        ).subscribe(([popBrandData]) => {

          const membershipData = null;

          res.render('membership.submain.html',
              { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipData, popBrandData });
        });
      } else { // 멤버십 등급 준회원, 선불폰, 유선서비스 가입자가 아닌 경우
        Observable.combineLatest(
            // this.getMembershipCheck(svcInfo),
            this.getMembershipData(),
            this.getPopBrandData(),
        ).subscribe(([membershipData, popBrandData]) => {

          this.logger.info(this, 'new membershipData : ', membershipData);

          res.render('membership.submain.html',
              { svcInfo, pageInfo, isLogin: this.isLogin(svcInfo), membershipData, popBrandData, isExpectRating });
        });
      }
    } else {  // 미로그인인 경우
      Observable.combineLatest(
          this.getPopBrandData()
      ).subscribe(([popBrandData]) => {

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

  // 나의 멤버십 카드 정보 조회
  private getMembershipData(): Observable<any> {
    let membershipData = null;
    return this.apiService.request(API_CMD.BFF_11_0001, {}).map((resp) => {
      this.logger.info(this, 'getMembershipData resp : ', resp);
      if ( resp.code === 'MBR0001' || resp.code === 'MBR0002' || resp.code === 'MBR0008' ) {
        resp.code = API_CODE.CODE_00;
        const membershipNoData = {
          showCardNumDash: '',
          showCardNum: '',
          showUsedAmount: '',
          mbrGrStr: '',
          mbrGrade: '',
          mbrTypStr: '',
          mbrCode: 'mbr'
        };
        return membershipNoData;
      } else if ( resp.code === API_CODE.CODE_00 ) {
        membershipData = this.parseMembershipData(resp.result);
        return membershipData;
      } else {
        return {
          mbrCode : '01',
          msg : resp.msg
        };
      }
    });
  }

  private parseMembershipData(membershipData): any {
    membershipData.showCardNumDash = FormatHelper.addCardDash(membershipData.mbrCardNum.toString());  // 서브메인 카드번호
    membershipData.showCardNum = FormatHelper.addCardSpace(membershipData.mbrCardNum);                // 멤버십바코드 팝업 카드번호
    membershipData.showUsedAmount = FormatHelper.addComma((+membershipData.mbrUsedAmt).toString());
    membershipData.mbrGrStr = MEMBERSHIP_GROUP[membershipData.mbrGrCd].toUpperCase();
    membershipData.mbrGrade = MEMBERSHIP_GROUP[membershipData.mbrGrCd].toLowerCase();
    membershipData.mbrTypStr = MEMBERSHIP_TYPE[membershipData.mbrTypCd];
    membershipData.mbrCode = '00';
    return membershipData;
  }

  // 제휴브랜드 조회
  private getPopBrandData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_11_0017, {'ordCol' : 'L', 'cateCd' : '00', 'pageNo' : '1', 'pageSize' : '10'}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  // 예상등급 조회 가능 날짜 확인
  private getIsExpectRating(): any {
    const curTime = moment();
    const startTime = moment('2020-12-17 14:00:00.000');
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
