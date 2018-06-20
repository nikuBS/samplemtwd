import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

export enum REFILL_HISTORY_HASH {
  MY = 'my',
  SENT = 'sent',
  RECEIVED = 'received'
}

class MyTRefillHistory extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    var type = req.query.type || REFILL_HISTORY_HASH.MY;
    Observable.combineLatest(
      this._getLineList()
    ).subscribe(([lineList]) => {
      this.renderView(res, 'refillrecharge/refill/refill.history.html', this._getData(lineList, type));
    });
  }

  public renderView(res: Response, view: string, data: any): any {
    //TODO error check
    res.render(view, data);
  }

  private _getLineList(): any {
    return this.apiService.request(API_CMD.BFF_03_0003, { svcCtg: 'M' });
  }

  private _getData(lineList: any, type: any): any {
    let result = {
      lineList: lineList.result
    };
    return result;
  }
}

export default MyTRefillHistory;
