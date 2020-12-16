import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import moment from 'moment';
import {LOGIN_TYPE} from '../../../../types/bff.type';
import DateHelper from '../../../../utils/date.helper';
/**
 * @file membership.info.grade.controller.ts
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.10.31
 */

class MembershipInfoGrade extends TwViewController {

  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // 예상등급 조회 가능 날짜 확인
    const isExpectRating = this.getIsExpectRating();

    const data = {
      isLogin: !FormatHelper.isEmpty(svcInfo),
      mbrGrCd: '',
      isJoinAble: true
    };

    if (data.isLogin && LOGIN_TYPE.TID === svcInfo.loginType && ['P', 'I', 'T', 'U', ''].indexOf(svcInfo.svcGr) === -1) {
      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_11_0001, {})
      ).subscribe(([membershipData]) => {

        if (membershipData.code === API_CODE.CODE_00 ) {
          data.isJoinAble = FormatHelper.isEmpty(membershipData.result.mbrGrCd);
        }

        res.render('info/membership.info.grade.html', {
          svcInfo,
          pageInfo,
          data,
          isExpectRating
        });

      });
    } else {
      res.render('info/membership.info.grade.html', {
        svcInfo,
        pageInfo,
        data,
        isExpectRating: false
      });
    }
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

export default MembershipInfoGrade;
