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

export default class MembershipMyCancel extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_11_0013, {}).subscribe((resp) => {
      let myCardData = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        myCardData = this.parseMyCardData(resp.result);
      } else {
        myCardData = resp;
      }

      res.render('my/membership.my.cancel.html', {
        myCardData: myCardData,
        svcInfo: svcInfo
      });
    });
  }

  private parseMyCardData(myCardData): any {
    myCardData.showMbrCardNum = FormatHelper.addCardDash(myCardData.mbrCardNum.toString());
    myCardData.mbrGrStr = MEMBERSHIP_GROUP[myCardData.mbrGrCd];
    myCardData.mbrTypStr = MEMBERSHIP_TYPE[myCardData.mbrTypCd];
    //myCardData.todayDate = DateHelper.getCurrentShortDate();
    //myCardData.cardReqCd = '1';

    return myCardData;
  }
}
