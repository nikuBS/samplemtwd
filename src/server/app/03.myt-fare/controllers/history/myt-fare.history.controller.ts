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

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.histData = {};
    this.selectedYear = null;
    this.selectedMonth = null;


    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    switch (query.current) {
      case 'monthly':
        this.renderMonthly(req, res, next, svcInfo,
            req.path.split('/').splice(-1)[0] ?
                req.path.split('/').splice(-2)[0] : req.path.split('/').splice(-3)[0]);
        break;
      case 'micro':
        this.renderMicroHistory(req, res, next, svcInfo);
        break;
      case 'contents':
        this.renderContentsHistory(req, res, next, svcInfo);
        break;
      case 'block':
        this.renderMicroBlockHistory(req, res, next, svcInfo);
        break;
      case 'detail':
        this.renderMicroContentsHistoryDetail(req, res, next, svcInfo);
        break;
      default:
        break;
    }
    // res.render('history/myt-fare.micro.history.html', {svcInfo: svcInfo});
  }

  renderMicroContentsHistoryDetail(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const isContents: boolean = req.path.split('/').splice(-2)[0] === 'contents';

    res.render('history/myt-fare.history.micro-contents.detail.html',
        {svcInfo: svcInfo, isContents: isContents});
  }

  renderMicroHistory(req: Request, res: Response, next: NextFunction, svcInfo: any) {
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

    this.getHistoryDataAndRender(API_CMD.BFF_05_0079, 'history/myt-fare.micro.history.html', params, res, svcInfo,
        reformCallback);
  }

  renderContentsHistory(req: Request, res: Response, next: NextFunction, svcInfo: any) {
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

    this.getHistoryDataAndRender(API_CMD.BFF_05_0064, 'history/myt-fare.contents.history.html', params, res, svcInfo,
        reformCallback);
  }

  renderMicroBlockHistory(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0093, {}).subscribe((resData) => {
      const currentDate = DateHelper.getShortDateWithFormat(new Date(), 'YYYYMMDD');
      // resData.result.payHistoryCnt = 1;
      // resData.result.cpHistories = [
      //   {
      //     'cpCode': 'thisistest',
      //     'belong': 'ISAS',
      //     'cpNm': '모빌리언스테스트',
      //     'tySvc': 'AY',
      //     'useDt': '2018-08-02 17:12',
      //     'idpg': 'MB',
      //     'applyMonth': '2018-09-01',
      //     'pgNm': '모빌리언스'
      //   }
      // ];


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

      // const renderData = {
      //   cpName: resData.result.cpNm,
      //   pgName: resData.result.pgNm,
      //   requestDate: resData.result.useDt,
      //   applyDate: resData.result.applyMonth
      // }
      res.render('history/myt-fare.micro.block.history.html', {svcInfo: svcInfo, data: resData.result.cpHistories});
    });
  }

  renderMonthly(req: Request, res: Response, next: NextFunction, svcInfo: any, parentPath: string) {
    const apiOption = {
      gubun: 'Request',
      requestCnt: 0
    };
    const API_CMD_NAME = (parentPath === 'micro') ? API_CMD.BFF_07_0073 : API_CMD.BFF_07_0081;

    this.apiService.request(API_CMD_NAME, apiOption).subscribe(() => {
      this.logger.info(this, apiOption);
      apiOption.gubun = 'Done';
      apiOption.requestCnt++;
      this.apiService.request(API_CMD_NAME, apiOption).subscribe((resData) => {
        res.render('history/myt-fare.history.monthly.html',
            {
              svcInfo: svcInfo, isMicro: parentPath === 'micro', currentMonth: DateHelper.getCurrentMonth(),
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
                                  res: Response, svcInfo: any, reformCallback: any, mockData?: any) {

    this.apiService.request(API_Name, paramObj).subscribe((resData) => {

      // this.logger.info(this, resData.code !== API_CODE.CODE_00);

      if (resData.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resData.code,
          msg: resData.msg,
          svcInfo: svcInfo
        });
      } else {
        const currentMonthKor = DateHelper.getShortDateWithFormat(new Date(), 'M' + MYT_STRING_KOR_TERM.month);

        const data = mockData ? mockData.result : resData.result;

        reformCallback(data);

        res.render(viewFileName, {
          svcInfo: svcInfo, currentMonth: currentMonthKor,
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
