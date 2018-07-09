/**
 * FileName: payment.point.controller.ts
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.06
 */
import TwViewController from '../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import {API_CMD, API_CODE} from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {PAYMENT_VIEW} from '../../../types/string.type';
import {REQUEST_VALUE} from '../../../types/bff-common.type';

class PaymentPointController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
      Observable.combineLatest(
          this.getAllCashbagAndTpoint(),
          this.getAllRainbowPoint()
      ).subscribe(([cashbagAndT, rainbowPoint]) => {
          this.renderView(res, 'payment.point.html', this.getData(svcInfo, cashbagAndT, rainbowPoint));
      });
  }

    public renderView(res: Response, view: string, data: any): any {
        if (data.isError) {
            res.render(PAYMENT_VIEW.ERROR, data);
        } else {
            res.render(view, data);
        }
    }

    private getAllCashbagAndTpoint(): Observable<any> {
        return Observable.combineLatest(
            this.getCashbagAndTpoint(),
            this.getAutoCashbag(),
            this.getAutoTpoint(),
            (cashbagAndTpoint, autoCashbag, autoTpoint) => {
                cashbagAndTpoint.isAutoCashbag = this.getAutoValue(autoCashbag);
                cashbagAndTpoint.isAutoTpoint = this.getAutoValue(autoTpoint);
                return cashbagAndTpoint;
            });
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
        return this.apiService.request(API_CMD.BFF_07_0051, {ptClCd: 'CPT'}).map((response) => {
            if (response.code === API_CODE.CODE_00) {
                return response.result.strRbpStatTxt;
            }
            return null;
        });
    }

    private getAutoTpoint(): Observable<any> {
        return this.apiService.request(API_CMD.BFF_07_0051, {ptClCd: 'TPT'}).map((response) => {
            if (response.code === API_CODE.CODE_00) {
                return response.result.strRbpStatTxt;
            }
            return null;
        });
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

            if (type === 'rainbow') {
                data.rainbowPt = FormatHelper.addComma(data.usableRbpPt);
            } else {
                data.cashbagPt = FormatHelper.addComma(data.availPt);
                data.tPt = FormatHelper.addComma(data.availTPt);
            }
    }
    return data;
  }

    private getData(svcInfo: any, cashbagAndT: any, rainbowPoint: any): any {
        return {
            svcInfo,
            cashbagAndT,
            rainbowPoint,
            isError: this.isError(cashbagAndT) || this.isError(rainbowPoint)
        };
    }

    private isError(data: any): boolean {
        return data.code !== undefined || data.isAutoCashbag === null || data.isAutoTpoint === null || data.isAutoRainbow === null;
  }
}

export default PaymentPointController;
