/**
 * @file myt-fare.bill.small.history.controller.ts
 * @author Lee kirim (kirim@sk.com)
 * @since 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import DateHelper from '../../../../utils/date.helper';

interface Info {
  [key: string]: string;
}

interface IYearMonth {
  curYear: string;
  curMonth: string;
}
interface IBeforeYearMonth {
  beforeYear: string;
  beforeMonth: string;
}

class MyTFareBillSmallHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {

    return res.render('billsmall/myt-fare.bill.small.history.html', {
      svcInfo,
      pageInfo, 
      data: {
        ...this._getCurMonth(), 
        ...this._getPrev6Month(),
        noticeInfo: this.getNoticeInfo(), // 꼭 확인해 주세요 팁 리스트,        
      }
    });
  }

  private _getCurMonth(): IYearMonth {
    return {
      curYear: DateHelper.getCurrentYear(),
      curMonth: DateHelper.getCurrentMonth()
    };
  }

  private _getPrev6Month(): IBeforeYearMonth {
    return {
      beforeYear: DateHelper.getFromCurrentPrevYear(new Date((new Date()).setDate(1)), 6), // 6개월 전 년도
      beforeMonth: DateHelper.getFromCurrentPrevMonth(new Date((new Date()).setDate(1)), 6) // 6개월 전 월
    };
  }

  // 꼭 확인해 주세요 팁 메뉴 정리
  private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_06_01_tip_01', view: 'M000269', title: '조회 안내'}
    ];
  }
}

export default MyTFareBillSmallHistory;
