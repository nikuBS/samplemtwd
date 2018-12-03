/**
 * FileName: myt-fare.bill.small.history.controller.ts
 * Author: Lee kirim (kirim@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_STRING_KOR_TERM} from '../../../../types/string.type';
import { MYT_FARE_HISTORY_MICRO_TYPE, MYT_FARE_HISTORY_MICRO_PAY_TYPE, MYT_FARE_HISTORY_MICRO_BLOCK_TYPE } from '../../../../types/bff.type';
import bill_guide_BFF_05_0079 from '../../../../mock/server/bill.guide.BFF_05_0079.mock';

interface Info {
  [key: string]: string;
}

interface Query {
  payMethod: string;
  fromDt: string;
  toDt: string;
}

class MyTFareBillSmallHistory extends TwViewController {

  fromDt;
  toDt;
  curYear;
  curMonth;
  beforeYear;
  beforeMonth;

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    // 조회할 달 수 구하기
    this.setDatePeriod(req);
  
    const query: Query = {
      payMethod: 'ALL',
      fromDt: this.fromDt,
      toDt: this.toDt
    };

    this.apiService.request(API_CMD.BFF_05_0079, query).subscribe((resp): any => {
       console.log('\x1b[36m%s\x1b[0m', '------log auto code', resp.code, resp.result);
      this.logger.info(this, resp.code !== API_CODE.CODE_00, resp);
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
          //  ,pageInfo: pageInfo
        });
      }

      const mockData = bill_guide_BFF_05_0079;
      const data = resp.result || mockData;

      let billList;
      
      if (data.histories !== undefined) {
        billList = data.histories.reverse().map((o, index) => {
          const blockState = MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[o.cpState] === undefined ? null : MYT_FARE_HISTORY_MICRO_BLOCK_TYPE[o.cpState];
          const plainTime = o.useDt.replace(/-/gi, '').replace(/:/gi, '').replace(/ /gi, '');
          return Object.assign(o, {
            listId: index, 
            FullDate: DateHelper.getShortDateAndTime(plainTime),
            useAmt: FormatHelper.addComma(o.sumPrice), // 이용금액
            payMethodNm: MYT_FARE_HISTORY_MICRO_TYPE[o.payMethod] || '', // 결제구분
            payWay: MYT_FARE_HISTORY_MICRO_PAY_TYPE[o.wapYn],
            isShowBlockBtn: (o.payMethod === '03' && blockState !== null), // 차단하기/내역 버튼 표기여부
            blockState: blockState || '', // 차단 상테
            isBlocked: blockState ? true : false, // 차단여부
          });
        });
      }

      res.render('billsmall/myt-fare.bill.small.history.html', {
        svcInfo: svcInfo, 
        pageInfo: pageInfo, 
        currentMonth: DateHelper.getCurrentMonth(this.fromDt) + MYT_STRING_KOR_TERM.month,  // 12월
        totalCnt: data.payHistoryCnt,
        data: {
          // 리스트를 위한 정보 전송
          billList: billList, 
          // 셀렉트 박스를 위한 정보 전송
          beforeYear: this.beforeYear,
          beforeMonth: this.beforeMonth,
          curYear: this.curYear,
          curMonth: this.curMonth,
          selectedYear: DateHelper.getCurrentYear(this.fromDt),
          selectedMonth: DateHelper.getCurrentMonth(this.fromDt),
          noticeInfo: this.getNoticeInfo()
        }
      });
      //
    });
    // this.renderContentsHistory(req, res, next, svcInfo, pageInfo);
  }

  // 조회할 달 수 구하기
  private setDatePeriod(req: Request) {
    const selectedYear = req.query.year || null;
    const selectedMonth = req.query.month ? (req.query.month.length > 1 ? req.query.month : '0' + req.query.month) : null;
    this.curYear = DateHelper.getCurrentYear(); // 현재 년도
    this.curMonth = DateHelper.getCurrentMonth(); // 현재 달
    this.beforeYear = DateHelper.getFromCurrentPrevYear(new Date((new Date()).setDate(1)), 6); // 6개월 전 년도
    this.beforeMonth = DateHelper.getFromCurrentPrevMonth(new Date((new Date()).setDate(1)), 6); // 6개월 전 월

    if (this.curMonth.length < 2) { 
      this.curMonth = '0' + this.curMonth;
    }

    if (this.beforeMonth.length < 2) { 
      this.beforeMonth = '0' + this.beforeMonth;
    }

    this.fromDt = DateHelper.getCurrentShortDate(new Date()).slice(0, 6) + '01';
    
    // 쿼리가 유효한지 체크
    // 선택된 년, 월이
    // 년도 + 월을 더해 숫자로 계산 선택된 년월이 사이에 있어야 함
    if (selectedYear && selectedMonth) {
      if (parseFloat(this.curYear + this.curMonth) >= parseFloat(selectedYear + selectedMonth) &&
      parseFloat(this.beforeYear + this.beforeMonth) < parseFloat(selectedYear + selectedMonth)
      ) {
        this.fromDt = selectedYear.toString() + (selectedMonth.length < 2 ? '0' + selectedMonth : selectedMonth) + '01';
      }
    }

    this.toDt = DateHelper.getEndOfMonth(this.fromDt, 'YYYYMMDD', 'YYYYMMDD');
  }

  // 꼭 확인해 주세요 팁 메뉴 정리
  private getNoticeInfo(): Info[] {
    return [
      {link: 'MF_06_01_tip_01', title: '조회 안내'}
    ];
  }
}

export default MyTFareBillSmallHistory;
