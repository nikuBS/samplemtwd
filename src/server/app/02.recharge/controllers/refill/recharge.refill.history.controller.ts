/**
 * FileName: recharge.refill.history.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.21
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export enum REFILL_HISTORY_HASH {
  MY = 'my',
  SENT = 'sent',
  RECEIVED = 'received'
}

class RechargeRefillHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const type = req.query.type || REFILL_HISTORY_HASH.MY;
    Observable.combineLatest(
      this._getLineList()
    ).subscribe(([lineList]) => {
      this.renderView(res, 'refill/recharge.refill.history.html', this._getData(lineList, type));
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    // TODO error check
    res.render(view, data);
  }

  private _getLineList(): any {
    return this.apiService.request(API_CMD.BFF_03_0003_C, { svcCtg: 'M' });
  }

  private _getData(lineList: any, type: any): any {
    const result = {
      lineList: lineList.result
    };
    return result;
  }
}

export default RechargeRefillHistory;
