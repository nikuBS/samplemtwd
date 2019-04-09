/**
 * @file membership.my.history.controller.ts
 * @author Seungkyu Kim (ksk4788@pineone.com)
 * @since 2018.12.27
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
      let noHistoryData = false;
      if ( resp.code === API_CODE.CODE_00) {
        if (Object.keys(resp.result).length === 0 && JSON.stringify(resp.result) === JSON.stringify({})) {
          noHistoryData = true;
          myHistoryData['record2'] = []; // 발급 변경 내역이 없는 경우 record2 field가 없어 에러가 발생하여 초기화
        } else {
          myHistoryData = this.parseMyHistoryData(resp.result.mHistOut);
        }
      } else {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      res.render('my/membership.my.history.html', {
        myHistoryData: myHistoryData,
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        noHistoryData: noHistoryData
      });
    });
  }

  private parseMyHistoryData(myHistoryData): any {
    for (let i = 0; i < myHistoryData.record2.length; i++) {
      // 서버에서 내려온 값에서 T'PLE 값과 같이 '(single quotation)이 붙는 경우 json 문자열로 변경 후 문제가 발생하여 값 초기화
      myHistoryData.record2[i].mbr_typ_nm_cnt2 = '';
    }

    return myHistoryData;
  }
}
