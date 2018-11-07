/**
 * FileName: customer.email.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

class CustomerEmail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, pageInfo?: any): void {
    const page = req.params.page;
    // const main_category = req.params.main_category; // 1. service 2. quality
    // const sub_category = req.params.sub_category; // ofrCtgSeq

    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req),
      svcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum),
      allSvc: allSvc
    };

    switch ( page ) {
      case 'complete':
        res.render('email/customer.email.complete.html', Object.assign(
          responseData,
          { email: req.query.email }
        ));
        break;
      case 'retry-service':
        res.render('email/customer.email.service.retry.html',
          Object.assign({}, responseData, {
            convertDate: this.convertDate
          })
        );
        break;
      case 'retry-quality':
        res.render('email/customer.email.quality.retry.html',
          Object.assign({}, responseData, {
            convertDate: this.convertDate
          })
        );
        break;
      case 'history':
        this.getEmailHistory()
          .subscribe((response) => {
            res.render('email/customer.email.history.html',
              Object.assign({}, responseData, {
                inquiryList: response.result,
                convertDate: this.convertDate
              })
            );
          })
        break;
      case 'history-detail':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd)
          .subscribe((response) => {
            res.render('email/customer.email.history.detail.html',
              Object.assign({}, responseData, { inquiryInfo: response.result })
            );
          })
        break;
      default:
        // Observable.combineLatest(
        // ).subscribe(([subscriptions]) => {
        //
        // });
        res.render('email/customer.email.html', responseData);
    }
  }

  private getEmailHistory() {
    return this.apiService.request(API_CMD.BFF_08_0060, {
      svcDvcClCd: 'M'
    });
  }

  private getEmailHistoryDetail(inqId, inqClCd) {
    return this.apiService.request(API_CMD.BFF_08_0061, {
      inqId: inqId,
      inqClCd: inqClCd,
      svcDvcClCd: 'M'
    });
  }

  public convertDate(sDate) {
    return DateHelper.getShortDate(sDate);
  }
}

export default CustomerEmail;
