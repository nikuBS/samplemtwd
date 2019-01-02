/**
 * FileName: membership.my.history.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.12.27
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
// import { Observable } from 'rxjs/Observable';
import { API_CODE } from '../../../../types/api-command.type';
import { MEMBERSHIP_DELIVERY_CODE } from '../../../../types/string.type';
import DateHelper from '../../../../utils/date.helper';

export default class MembershipMyHistory extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_11_0010, {}).subscribe((resp) => {
      let myHistoryData = {};
      if ( resp.code === API_CODE.CODE_00 ) {
        myHistoryData = this.parseMyHistoryData(resp.result.mHistOut);
      } else {
        myHistoryData = resp;
      }

      res.render('my/membership.my.history.html', {
        myHistoryData: myHistoryData,
        svcInfo: svcInfo
      });
    });
  }

  private parseMyHistoryData(myHistoryData): any {

    for (let i = 0; i < myHistoryData.record2.length; i++) {
      myHistoryData.record2[i].mbr_typ_nm_cnt2 = '';
    }

    myHistoryData.record1.show_card_req_cd = MEMBERSHIP_DELIVERY_CODE[myHistoryData.record1[0].card_req_cd];
    myHistoryData.record1.show_card_req_dt = DateHelper.getShortDateWithFormat(myHistoryData.record1.card_req_dt, 'YYYY.M.DD.', 'YYYYMMDD');

    return myHistoryData;
  }
}
