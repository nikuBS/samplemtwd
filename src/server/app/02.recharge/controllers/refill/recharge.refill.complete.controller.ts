/**
 * FileName: recharge.refill.complete.controller
 * Author: 공자윤
 * Date: 2018.06.18
 **/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import MyTUsage from '../../../01.myt/controllers/usage/myt.usage.controller';

class RechargeRefillComplete extends TwViewController {
  public myTUsage = new MyTUsage();

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_06_0001, {}).subscribe((resp) => {
      this.myTUsage.renderView(res, 'refill/refill.complete.html', { usageData: this.getResult(resp, {}) });
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

export default RechargeRefillComplete;
