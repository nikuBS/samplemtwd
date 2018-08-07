/**
 * FileName: payment.point.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.06
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import { SELECT_POINT } from '../../../types/string.type';
import { PAYMENT_OPTION_TEXT, REQUEST_VALUE, SVC_ATTR } from '../../../types/bff.type';
import StringHelper from '../../../utils/string.helper';
import DateHelper from '../../../utils/date.helper';

class PaymentPointController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getAllCashbagAndTpoint(),
      this.getAllRainbowPoint()
    ).subscribe(([cashbagAndT, rainbowPoint]) => {
      res.render('payment.point.html', this.getData(svcInfo, cashbagAndT, rainbowPoint));
    });
  }

  private getAllCashbagAndTpoint(): Observable<any> {
    return Observable.combineLatest(
      this.getCashbagAndTpoint(),
      this.getAutoCashbag(),
      this.getAutoTpoint(),
      (cashbagAndTpoint, autoCashbag, autoTpoint) => {
        return this.getCashbagAndT(cashbagAndTpoint, autoCashbag, autoTpoint);
      });
  }

  private getCashbagAndT(cashbagAndTpoint: any, autoCashbag: any, autoTpoint: any): any {
    cashbagAndTpoint.isAutoCashbag = this.getAutoValue(autoCashbag.strRbpStatTxt);
    cashbagAndTpoint.isAutoTpoint = this.getAutoValue(autoTpoint.strRbpStatTxt);
    cashbagAndTpoint.cashbagEndDate = autoCashbag.endDate;
    cashbagAndTpoint.tEndDate = autoTpoint.endDate;
    cashbagAndTpoint.cOcbTermTodoAmt = autoCashbag.ocbTermTodoAmt;
    cashbagAndTpoint.tOcbTermTodoAmt = autoTpoint.ocbTermTodoAmt;
    cashbagAndTpoint.cAmtText = autoCashbag.amtText;
    cashbagAndTpoint.tAmtText = autoTpoint.amtText;
    return cashbagAndTpoint;
  }

  private getAllRainbowPoint(): Observable<any> {
    return Observable.combineLatest(
      this.getRainbowPoint(),
      this.getAutoRainbowPoint(),
      (rainbowPoint, autoRainbowPoint) => {
        rainbowPoint.isAutoRainbow = this.getAutoValue(autoRainbowPoint);
        return rainbowPoint;
      });
  }

  private getCashbagAndTpoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0041, {}).map((response) => {
      return this.parseData(response);
    });
  }

  private getAutoCashbag(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0051, { ptClCd: 'CPT' }).map((response) => {
      return this.getAutoData(response);
    });
  }

  private getAutoTpoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0051, { ptClCd: 'TPT' }).map((response) => {
      return this.getAutoData(response);
    });
  }

  private getAutoData(response: any): any {
    if (response.code === API_CODE.CODE_00) {
      return {
        strRbpStatTxt: response.result.strRbpStatTxt,
        endDate: FormatHelper.isEmpty(response.result.disOcbEffDate) ? DateHelper.getNextYearShortDate()
          : DateHelper.getShortDateNoDot(response.result.disOcbEffDate),
        ocbTermTodoAmt: FormatHelper.addComma(response.result.ocbTermTodoAmt),
        amtText: FormatHelper.isEmpty(response.result.ocbTermTodoAmt) ? SELECT_POINT.DEFAULT : FormatHelper.addComma(response.result.ocbTermTodoAmt)
      };
    }
    return null;
  }

  private getRainbowPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0042, {}).map((response) => {
      return this.parseData(response, 'rainbow');
    });
  }

  private getAutoRainbowPoint(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_07_0052, {}).map((response) => {
      if (response.code === API_CODE.CODE_00) {
        return response.result.reqStateNm;
      }
      return null;
    });
  }

  private getAutoValue(data: any): any {
    if (data === REQUEST_VALUE.Y) {
      data = true;
    } else if (data === REQUEST_VALUE.N) {
      data = false;
    }
    return data;
  }

  private parseData(data: any, type?: string): any {
    if (data.code === API_CODE.CODE_00) {
      data = data.result;
      data.code = API_CODE.CODE_00;

      if (type === 'rainbow') {
        data.rainbowPt = FormatHelper.addComma(data.usableRbpPt);
      } else {
        data.cashbagPt = FormatHelper.addComma(data.availPt);
        data.tPt = FormatHelper.addComma(data.availTPt);
        data.cardNum = StringHelper.masking(data.ocbCcno, '*', 10);
      }
      data.endDate = DateHelper.getNextYearShortDate();
    } else {
      data.rainbowPt = PAYMENT_OPTION_TEXT.ZERO;
    }
    return data;
  }

  private getData(svcInfo: any, cashbagAndT: any, rainbowPoint: any): any {
    return {
      svcInfo: this.getSvcInfo(svcInfo),
      cashbagAndT,
      rainbowPoint,
      isError: this.isError(cashbagAndT) || this.isError(rainbowPoint)
    };
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR[svcInfo.svcAttrCd];
    return svcInfo;
  }

  private isError(data: any): boolean {
    return data.code !== undefined || data.isAutoCashbag === null || data.isAutoTpoint === null || data.isAutoRainbow === null;
  }
}

export default PaymentPointController;
