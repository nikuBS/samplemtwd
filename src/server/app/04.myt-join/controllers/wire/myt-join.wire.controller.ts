/**
 * FileName: myt-join.wire.controller.ts
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

        let asCnt: any = 0;
        if ( r0156as.code === API_CODE.CODE_00 && r0156as.result ) {
          asCnt = r0156as.result.totalCnt;
        }

        const infoData = {
          'svcNm': svcInfo.prodNm,
          'addr': svcInfo.addr,
          'newAndChgCnt' : newAndChgCnt,
          'asCnt': asCnt
        };

        infoData['asCnt'] = asCnt;

        res.render('wire/myt-join.wire.html', { svcInfo: svcInfo, data: infoData });
      });

  }

  private _getResultCnt( resp: any ): number {

    const list: any = resp.result;

    if ( resp.code === API_CODE.CODE_00 && list ) {
      if ( Array.isArray(list) ) {
        for ( let i = list.length; i >= 0; i-- ) {
          if ( !list[i] ) {
            // 빈값 삭제
            list.splice(i, 1);
          }
        }
        return list.length;

      } else if ( typeof(list) === 'object' ) {
        if ( Object.keys(list).length === 0 ) {
          return 0;
        }
        return 1;
      } else {
        return 0;
      }
    } else {
      // log 남기기
      return 0;
    }
  }

}

export default MyTJoinWire;

