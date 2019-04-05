/**
 * @file myt-fare.info.bill.controller.ts
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

interface Query {
  isQueryEmpty: boolean;
}

interface Info {
  [key: string]: string;
}

class MyTFareInfoBill extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query)
    };
  
    this.apiService.request(API_CMD.BFF_07_0004, {}).subscribe((resp) => {

      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }

      resp.result.map((o) => {
        o.dataDt = DateHelper.getShortDate(o.opDt);
        o.dataAmt = FormatHelper.addComma(o.opAmt);
        o.sortDt = o.opDt;
        o.dataPhoneNumber = FormatHelper.conTelFormatWithDash(o.svcNum);
      });

      resp.result = resp.result.reduce((prev, cur, index) => {
        cur.listId = index;
        cur.listDt = cur.dataDt; // .slice(5);

        if (prev.length) {
          if (prev.slice(-1)[0].sortDt.slice(0, 4) !== cur.sortDt.slice(0, 4)) {
            cur.yearHeader = cur.sortDt.slice(0, 4);
          }
        }

        prev.push(cur);

        return prev;
      }, []);

      res.render('info/myt-fare.info.bill-cash.html', {svcInfo: svcInfo, pageInfo: pageInfo, data: {
          list: resp.result,
          noticeInfo: this.getNoticeInfo() || []
        }});
    });    
  }

   // 꼭 확인해 주세요 팁 메뉴 정리
   private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_08_01_02_tip_01', view: 'M000295', title: '현금영수증 발급내역 확인'}
    ];
  }

}

export default MyTFareInfoBill;
