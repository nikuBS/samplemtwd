import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTUsage from '../../usage/myt.usage.controller';

class MyTRefillComplete extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    Observable.combineLatest(
      this.getusageData()
    ).subscribe(([usageData]) => {
      this.myTUsage.renderView(res, 'refillrecharge/refill/refill.complete.html', usageData);
    });
  }

  private getusageData(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map((resp) => {
      return this.getResult(resp, {});
    });
  }

  private getResult(resp: any, usageData: any): any {
    if (resp.code === API_CODE.CODE_00) {
      usageData = resp.result.length;
    } else {
      usageData = resp;
    }
    return usageData;
  }
}

export default MyTRefillComplete;
