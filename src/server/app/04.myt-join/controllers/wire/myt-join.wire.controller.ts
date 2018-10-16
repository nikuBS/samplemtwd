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

    Observable.combineLatest(this.apiService.request(API_CMD.BFF_05_0001, {}))
      .subscribe(([resp]) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const option = { svcInfo: svcInfo, data: {} };

          res.render('wire/myt-join.wire.html', option);
        }
    });


  }
}

export default MyTJoinWire;

