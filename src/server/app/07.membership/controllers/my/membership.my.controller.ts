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

export default class MembershipMy extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_11_0002, {}).subscribe((resp) => {
      let myInfoData = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        myInfoData = this.parseMyInfoData(resp.result);
      } else {
        myInfoData = resp;
      }

      res.render('my/membership.my.html', {
        myInfoData: myInfoData,
        svcInfo: svcInfo
      });
    });
  }

  private parseMyInfoData(myInfoData): any {
    //myInfoData.showCardNum = FormatHelper.addCardDash(myInfoData.mbrCardNum.toString());
    myInfoData.showPayAmtScor = FormatHelper.addComma((+myInfoData.payAmtScor).toString());
    myInfoData.mbrGrStr = MEMBERSHIP_GROUP[myInfoData.mbrGrCd].toUpperCase();
    myInfoData.mbrTypStr = MEMBERSHIP_TYPE[myInfoData.mbrTypCd];
    return myInfoData;
  }
}
