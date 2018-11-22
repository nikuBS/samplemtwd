/**
 * FileName: myt-fare.history.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
// import {Observable} from 'rxjs/Observable';

// import {MYT_PAY_HISTORY_TITL} from '../../../../types/bff.type';
// import {DATE_FORMAT, MYT_BILL_HISTORY_STR} from '../../../../types/string.type';
import {MYT_STRING_KOR_TERM} from '../../../../types/string.type';
import {MYT_FARE_HISTORY_MICRO_TYPE} from '../../../../types/bff.type';


// import MyTFareHistoryPaymentMock from '../../../../mock/server/myt.fare.history.micro-payment';

// import MyTFareHistoryContentsMock from '../../../../mock/server/myt.fare.history.contents';

interface Query {
  current: string;
  isQueryEmpty: boolean;
  type: string;
  parent: string;
}

interface Histories {
  [key: string]: History;
}

interface History {
  [key: string]: any;
}


class MyTFareMicroHistory extends TwViewController {

  termSelectValue = 12;
  histData;
  selectedYear;
  selectedMonth;
  isContents;
  URL = {
    block: '/myt/fare/bill/small/block',
    detailSmall: '/myt/fare/bill/small/detail',
    detailContents: '/myt/fare/bill/contents/detail'
  };

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    this.histData = {};
    this.selectedYear = null;
    this.selectedMonth = null;


    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0],
      type: req.query.type,
      parent: req.path.split('/').splice(-1)[0] ?
          req.path.split('/').splice(-2)[0] : req.path.split('/').splice(-3)[0]
    };

    this.isContents = query.parent === 'billcontents';

    if (!this.isContents) {
      switch (query.current) {
        case 'history':
          this.renderMicroHistory(req, res, next, svcInfo, pageInfo);
          break;
        case 'block':
          /*
            차단 내역의 경우 API상에서 차단 해제 후 다시 차단 할 수 있는 방법이 없음.
            SB수정된 부분도 해당 내용이 누락되어 있어 이슈 발생 가능성 있음.
           */
          this.renderMicroBlockHistory(req, res, next, svcInfo, pageInfo);
          break;
        case 'monthly':
          this.renderMonthly(req, res, next, svcInfo, pageInfo, query.current);
          break;
        case 'detail':
          this.renderMicroContentsHistoryDetail(req, res, next, svcInfo, pageInfo);
          break;
        default:
          this.error.render(res, {
            svcInfo: svcInfo
          });
          break;
      }
    } else {
      switch (query.current) {
        case 'history':
          this.renderContentsHistory(req, res, next, svcInfo, pageInfo);
          break;
        case 'monthly':
          this.renderMonthly(req, res, next, svcInfo, pageInfo, query.current);
          break;
        case 'detail':
          this.renderMicroContentsHistoryDetail(req, res, next, svcInfo, pageInfo);
          break;
        default:
          this.error.render(res, {
            svcInfo: svcInfo
          });
          break;
      }
    }
  }

  renderMicroContentsHistoryDetail(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    res.render('history/myt-fare.history.micro-contents.detail.html',
        {svcInfo: svcInfo, isContents: this.isContents, pageInfo: pageInfo, blockURL: this.URL.block});
  }

  renderMicroHistory(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const startYYYYMMDD = DateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD').slice(0, 6) + '01';
    const endYYYYMMDD = DateHelper.getEndOfMonth(
        DateHelper.getShortDateWithFormatAddByUnit(startYYYYMMDD, this.termSelectValue * -1, 'months', 'YYYYMMDD'), 'YYYYMMDD');

    const params = {
      payMethod: 'ALL',
      fromDt: endYYYYMMDD,
      toDt: startYYYYMMDD
    };

    const reformCallback = (data: any): any => {
      if (data.histories !== undefined) {
        data.histories.map((o) => {
          o.paymentType = MYT_FARE_HISTORY_MICRO_TYPE[o.payMethod];
          o.useDtFormed = DateHelper.getShortDateWithFormat(o.useDt, 'YYYY.MM.DD hh:mm:ss');
          o.sumPriceFormed = FormatHelper.addComma(o.sumPrice);

          const year: string = o.useDt.slice(0, 4);
          const month: string = DateHelper.getShortDateWithFormat(year + o.useDt.slice(5, 7), 'M', 'YYYYMM');

          this.setYearMonthData(o, year, month);
        });
      }
    };

    this.getHistoryDataAndRender(API_CMD.BFF_05_0079, 'history/myt-fare.micro.history.html', params, res, svcInfo, pageInfo,
        reformCallback, this.URL.detailSmall);
  }

  renderContentsHistory(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {
    const startYYYYMMDD = DateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD').slice(0, 6) + '01';
    const endYYYYMMDD = DateHelper.getEndOfMonth(
        DateHelper.getShortDateWithFormatAddByUnit(startYYYYMMDD, this.termSelectValue * -1, 'months', 'YYYYMMDD'), 'YYYYMMDD');

    const params = {
      fromDt: endYYYYMMDD,
      toDt: startYYYYMMDD
    };

    const reformCallback = (data: any): any => {
      if (data.useConAmtDetailList !== undefined) {
        data.useConAmtDetailList.map((o) => {
          o.useDtFormed = DateHelper.getShortDateWithFormat(o.payTime, 'YYYY.MM.DD hh:mm:ss');
          o.sumPriceFormed = FormatHelper.addComma(o.useCharge);

          const year: string = o.payTime.slice(0, 4);
          const month: string = DateHelper.getShortDateWithFormat(year + o.payTime.slice(4, 6), 'M', 'YYYYMM');

          this.setYearMonthData(o, year, month);
        });
      }
    };

    this.getHistoryDataAndRender(API_CMD.BFF_05_0064, 'history/myt-fare.contents.history.html', params, res, svcInfo, pageInfo,
        reformCallback, this.URL.detailContents);
  }

  renderMicroBlockHistory(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0093, {}).subscribe((resData) => {
      const currentDate = DateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD');

      if (resData.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resData.code,
          msg: resData.msg,
          svcInfo: svcInfo
          // ,pageInfo: pageInfo
        });
      }

      if (parseInt(resData.result.payHistoryCnt, 10) !== 0) {
        resData.result.cpHistories.map((o) => {
          // this.logger.info(this, DateHelper.getCurrentShortDate(new Date()), DateHelper.getShortDateWithFormat(o.applyMonth, 'YYYYMMDD'));
          o.isBlocked = parseInt(currentDate, 10) >= parseInt(o.applyMonth.substr(0, 10).replace(/-/g, ''), 10);
          o.requestDate = DateHelper.getShortDateWithFormat(o.useDt, 'YYYY.M.D');
          o.applyDate = DateHelper.getShortDateWithFormat(o.applyMonth, 'YYYY.M.D');
        });
      } else {
        resData.result.cpHistories = [];
      }

      res.render('history/myt-fare.micro.block.history.html',
          {svcInfo: svcInfo, pageInfo: pageInfo, data: resData.result.cpHistories});
    });
  }

  renderMonthly(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any, parentPath: string) {
    const apiOption = {
      gubun: 'Request',
      requestCnt: 0
    };
    const API_CMD_NAME = (parentPath === 'billsmall') ? API_CMD.BFF_07_0073 : API_CMD.BFF_07_0081;

    this.apiService.request(API_CMD_NAME, apiOption).subscribe(() => {
      apiOption.gubun = 'Done';
      apiOption.requestCnt++;
      this.apiService.request(API_CMD_NAME, apiOption).subscribe((resData) => {
        res.render('history/myt-fare.history.monthly.html',
            {
              svcInfo: svcInfo, isMicro: parentPath === 'micro', currentMonth: DateHelper.getCurrentMonth(),
              pageInfo: pageInfo,
              data: this.setMonthlyData(resData.result)
            });
      });
    });
  }

  private setYearMonthData(o: any, year: string, month: string) {
    if (!this.selectedYear || this.selectedYear !== year) {
      const tempObj: History = {};

      this.selectedYear = year;
      this.selectedMonth = month;

      tempObj[month] = [o];
      this.histData[this.selectedYear] = tempObj;
    } else {
      this.selectedYear = year;
      if (!this.selectedMonth || this.selectedMonth !== month) {
        this.selectedMonth = month;
        this.histData[this.selectedYear][this.selectedMonth] = [o];
      } else {
        this.selectedMonth = month;
        this.histData[this.selectedYear][this.selectedMonth].push(o);
      }
    }
  }

  private getHistoryDataAndRender(API_Name: any, viewFileName: string, paramObj: any,
                                  res: Response, svcInfo: any, pageInfo: any, reformCallback: any, detailURL: string, mockData?: any) {

    this.apiService.request(API_Name, paramObj).subscribe((resData) => {

      this.logger.info(this, resData.code !== API_CODE.CODE_00, resData);

      if (resData.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resData.code,
          msg: resData.msg,
          svcInfo: svcInfo
          //  ,pageInfo: pageInfo
        });
      } else {
        const currentMonthKor = DateHelper.getShortDateWithFormat(new Date(), 'M' + MYT_STRING_KOR_TERM.month);

        // this.logger.info(this, resData)

        const data = mockData ? mockData.result : resData.result;

        reformCallback(data);

        res.render(viewFileName, {
          svcInfo: svcInfo, pageInfo: pageInfo, currentMonth: currentMonthKor, detailURL: detailURL,
          data: {termSelectValue: this.termSelectValue}, historyData: JSON.stringify(this.histData)
        });
      }
    });

  }


  private setMonthlyData(resData: any): any {
    return {
      usageAmount: FormatHelper.addComma(resData.tmthUseAmt),
      useLimit: FormatHelper.addComma(resData.microPayLimitAmt || resData.useContentsLimitAmt),
      restLimit: FormatHelper.addComma(resData.remainUseLimit),
      prepaid: FormatHelper.addComma(resData.tmthChrgAmt),
      restPrepay: FormatHelper.addComma(resData.tmthChrgPsblAmt)
    };
  }
}

export default MyTFareMicroHistory;
