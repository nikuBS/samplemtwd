/**
 * @file membership.my.reissue.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.01.29
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { MEMBERSHIP_GROUP, MEMBERSHIP_TYPE } from '../../../../types/bff.type';

export default class MembershipMyReissue extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_11_0003, {}).subscribe((resp) => {
      let myReissueData = {};

      if ( resp.code === API_CODE.CODE_00 ) {
        myReissueData = this.parseMyReissueData(resp.result);
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      res.render('my/membership.my.reissue.html', {
        myReissueData: myReissueData,
        svcInfo: svcInfo,
        pageInfo: pageInfo
      });
    });
  }

  private parseMyReissueData(myReissueData): any {
    const mbrGrade = MEMBERSHIP_GROUP[myReissueData.mbrGrCd];
    myReissueData.showGrade = myReissueData.mbrGrCd === 'V' ? mbrGrade.toUpperCase() : mbrGrade.charAt(0).toUpperCase() + mbrGrade.slice(1);
    myReissueData.showType = MEMBERSHIP_TYPE[myReissueData.mbrTypCd];
    myReissueData.showSvcNum = FormatHelper.conTelFormatWithDash(myReissueData.svcNum);
    myReissueData.showMbrCardNum = FormatHelper.addCardDash(myReissueData.mbrCardNum);

    return myReissueData;
  }
}
