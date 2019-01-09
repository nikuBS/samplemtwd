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
import { Observable } from 'rxjs/Observable';

class CustomerEmail extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, pageInfo?: any): void {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isApp: BrowserHelper.isApp(req),
      svcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum),
      allSvc: allSvc,
      convertTelFormat: this.convertTelFormat
    };

    switch ( page ) {
      case 'complete':
        res.render('email/customer.email.complete.html', Object.assign(
          responseData,
          { email: req.query.email }
        ));
        break;
      case 'service-retry':
        Observable.combineLatest(
          this.getServiceCategory(),
          this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd)
        ).subscribe(([serviceCategory, historyDetail]) => {
          res.render('email/customer.email.service.retry.html',
            Object.assign({}, responseData, {
              serviceCategory: serviceCategory.result,
              inquiryInfo: historyDetail.result,
              convertDate: this.convertDate
            })
          );
        });
        break;
      case 'quality-retry':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd)
          .subscribe((response) => {
            res.render('email/customer.email.quality.retry.html',
              Object.assign({}, responseData, {
                inquiryInfo: response.result,
                convertDate: this.convertDate
              })
            );
          });
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
          });
        break;
      case 'history-detail':
        this.getEmailHistoryDetail(req.query.inqid, req.query.inqclcd)
          .subscribe((response) => {
            res.render('email/customer.email.history.detail.html',
              Object.assign({}, responseData, {
                inquiryInfo: response.result,
                convertDate: this.convertDate,
                hideEmail: this.hideEmail
              })
            );
          });
        break;
      default:
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

  private getServiceCategory() {
    return this.apiService.request(API_CMD.BFF_08_0010, {});
  }

  public convertDate = (sDate) => DateHelper.getShortDate(sDate);
  public convertTelFormat = (sPhoneNumber) => FormatHelper.conTelFormatWithDash(sPhoneNumber);
  public hideEmail = (sEmail) => {
    const prefixEMail = sEmail.slice(0, 2);
    const suffixEmail = sEmail.slice(2).replace(/[^@]/g, '*');
    return prefixEMail + suffixEmail;
  }
}

export default CustomerEmail;
