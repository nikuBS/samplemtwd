import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {Observable} from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {LOGIN_TYPE} from '../../../../types/bff.type';
/**
 * FileName: membership.info.grade.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.31
 */

class MembershipInfoGrade extends TwViewController {

  constructor() {
    super();
  }
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

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
          data
        });

      });
    } else {
      res.render('info/membership.info.grade.html', {
        svcInfo,
        pageInfo,
        data
      });
    }
  }
}

export default MembershipInfoGrade;
