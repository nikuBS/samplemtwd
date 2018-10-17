/**
 * FileName: myt-join.wire.gifts.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';


class MyTJoinWire extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0167, {}),
      this.apiService.request(API_CMD.BFF_05_0162, {}),
      this.apiService.request(API_CMD.BFF_05_0168, {}),
      this.apiService.request(API_CMD.BFF_05_0143, {}),
      this.apiService.request(API_CMD.BFF_05_0153, {}),
      this.apiService.request(API_CMD.BFF_05_0156, { page: '1', size: '20' }))
      .subscribe(([r0167newJoin, r0162chgAddr, r0168prodChg, r0143periChg, r0153prodChg, r0156as]) => {
        let newAndChgCnt = this._getResultCnt(r0167newJoin);
        newAndChgCnt += this._getResultCnt(r0162chgAddr);
        newAndChgCnt += this._getResultCnt(r0168prodChg);
        newAndChgCnt += this._getResultCnt(r0143periChg);
        newAndChgCnt += this._getResultCnt(r0153prodChg);

        const asCnt = this._getResultCnt(r0156as);
        const data = { newAndChgCnt: newAndChgCnt, asCnt: asCnt };
        const option = { svcInfo: svcInfo, data: data };
        console.log(svcInfo);
        res.render('wire/myt-join.wire.html', option);
      });

  }

  private _getResultCnt( resp: any ): number {
    if ( resp.code === API_CODE.CODE_00 ) {
      if ( Array.isArray(resp.result) ) {
        return resp.result.length;
      } else {
        return 1;
      }
    } else {
      // log 남기기
      return 0;
    }
    return 0;
  }
}

export default MyTJoinWire;

