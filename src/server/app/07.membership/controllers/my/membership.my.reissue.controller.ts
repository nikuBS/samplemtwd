/**
 * FileName: membership.my.reissue.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.01.29
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
        myReissueData = resp;
      }

      res.render('my/membership.my.reissue.html', {
        myReissueData: myReissueData,
        svcInfo: svcInfo
      });
    });
  }

  private parseMyReissueData(myReissueData): any {
    myReissueData.showGrade = MEMBERSHIP_GROUP[myReissueData.mbrGrCd]
    myReissueData.showType = MEMBERSHIP_TYPE[myReissueData.mbrTypCd];
    myReissueData.showSvcNum = FormatHelper.conTelFormatWithDash(myReissueData.svcNum);
    myReissueData.showMbrCardNum = FormatHelper.addCardDash(myReissueData.mbrCardNum);

    return myReissueData;
  }
}
