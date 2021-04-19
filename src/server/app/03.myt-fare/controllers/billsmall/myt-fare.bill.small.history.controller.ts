/**
 * @file [소액결제-결제내역-리스트] 관련 처리
 * @author Lee kirim
 * @since 2018-09-17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import DateHelper from '../../../../utils/date.helper';

/**
 * 팁정보 형태 정의
 */
interface TipInfo {
  [key: string]: string;
}

/**
 * _getCurMonth 함수 현재 년/월 반환값 형태 정의
 */
interface IYearMonth {
  curYear: string;
  curMonth: string;
}

/**
 * _getPrev6Month 함수 6개월전 년/월 반환값 형태 정의
 */
interface IBeforeYearMonth {
  beforeYear: string;
  beforeMonth: string;
}

/**
 * 소액결제내역 렌더링 구현 
 * 인증하기 업무가 있어 서버에서는 데이터 조회하지 않음
 * 6개월 전 내역까지 조회되도록 현재 년월 / 과거년월 정보와 팁 정보 렌더링
 */
class MyTFareBillSmallHistory extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // contents 경로로 진입한 경우 small 로 리다이렉트 시킨다.
    if (_req.path.indexOf('small') < 0) {
      res.redirect('/myt-fare/bill/small/history');
      return;
    }

    return res.render('billsmall/myt-fare.bill.small.history.html', {
      svcInfo,
      pageInfo, 
      data: {
        ...this._getCurMonth(), 
        ...this._getPrev6Month(),
        isBubin: ['R', 'D'].indexOf(svcInfo.svcGr) > -1 // 법인 C, D (회선등급 C의 경우 정책서 상에는 svcGr 값이 C이고 시스템 상에는 svcGr 값이 R)
        // noticeInfo: this.getTipInfo(), // 꼭 확인해 주세요 팁 리스트,
      }
    });
  }

  /**
   * @function
   * @returns {IYearMonth}
   */
  private _getCurMonth(): IYearMonth {
    return {
      curYear: DateHelper.getCurrentYear(),
      curMonth: DateHelper.getCurrentMonth()
    };
  }

  /**
   * @function
   * @returns {IBeforeYearMonth}
   */
  private _getPrev6Month(): IBeforeYearMonth {
    return {
      beforeYear: DateHelper.getFromCurrentPrevYear(new Date((new Date()).setDate(1)), 6), // 6개월 전 년도
      beforeMonth: DateHelper.getFromCurrentPrevMonth(new Date((new Date()).setDate(1)), 6) // 6개월 전 월
    };
  }

  /**
   * @desc 꼭 확인해주세요 TIP 정리
   * @prop {string} link 팁 클래스
   * @prop {string} view 팁 아이디
   * @prop {srting} title 문구
   * @returns {TipInfo[]}
   */
  private getTipInfo(): TipInfo[] {
    return [
      {link: 'MF_06_01_tip_01', view: 'M000269', title: '조회 안내'}
    ];
  }
}

export default MyTFareBillSmallHistory;
