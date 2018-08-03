/**
 * FileName: myt.bill.history.contents.limit.controller.ts
 * Author: 이상형 (silion@sk.com)
 * Date: 2018.07.26
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import {Observable} from 'rxjs/Observable';


class MyTBillHistoryContentsLimit extends TwViewController {

  private usageRequestTitle: string = 'Request';
  private usageRequestCounter: number = 0;

  constructor() {
    super();
  }

  // private

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    // this.apiService.request(API_CMD.BFF_07_0081, {
    //   gubun: this.usageRequestTitle,
    //   requestCnt: this.usageRequestCounter
    // }).subscribe((response) => {
    //   this.logger.info(this, '[limit first-step]', response);
    const currentM = DateHelper.getShortDateWithFormat(new Date(), 'M');
    this.renderView(res, 'bill/myt.bill.history.contents.limit.html', {
      svcInfo: svcInfo,
      type: 'contents',
      currentM: currentM
    });
    // });

    // Observable.combineLatest(
    //     this.getLimitData()
    // ).subscribe(([limitData]) => {
    //   this.renderView(res, 'bill/myt.bill.history.contents.limit.html', this.setData(limitData, svcInfo));
    // });

    // return this.apiService.request().subscribe((response) => {
    // this.apiService.request().subscribe((response) => {
    //   const currentM = DateHelper.getShortDateWithFormat(new Date(), 'M');
    //
    //   // if(response.code)
    //   res.render('bill/myt.bill.history.contents.limit.html', {
    //     svcInfo: svcInfo,
    //     currentM: currentM
    //   });
    // });

  }

  renderView(res: Response, view: string, data: any): any {
    res.render(view, data);
  }

}


export default MyTBillHistoryContentsLimit;
